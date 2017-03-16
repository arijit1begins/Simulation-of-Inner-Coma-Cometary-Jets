 ' fk 67P Comet OpenGL example   07/04/2015
' Revision 09/04/2015 : added a kind of random color per face in order to simulate some texture
' Revision 10/04/2015 :
                        'Added the facility to make selection of TWO possible shape maps I currently can find on the web
                        'Added the facility of choosing light sources

' This code was derived from Gary Beenes' : gbs_00586 code Date: 03-10-2012
' T added the Comet option , which reads a data file holding the comets 67P mesh
' The first file is the .obj file which can be found here :  http://sci.esa.int/rosetta/54728-sha...-of-comet-67p/
' The second is the .obj file :http://mattias.malmer.nu/category/rosetta/
' Just save the file as it comes
 ' Note : as both .obj files don't provide a texture I had to apply some face color to each face
' I've choosen the color (texture illusion ) being a function of the local slope
 #Compiler PBWin 9, PBWin 10
#Compile Exe
#Dim All
#Include "win32api.inc"
#Include "gl.inc"
#Include "glu.inc"
 %ID_Timer = 1001 : %ID_Label = 1002
 Global hDlg, hDC, hRC, hLabel As Dword
Global scalefactor As Single
Global LightPosition(),LightPosition2() As Single
Global x(),y(),z() As Single
Global f(),coltex() As Long
Global fn() As Single
Global vertices&,faces&
 Function PBMain() As Long
    Dialog New Pixels, 0, "OpenGL Example 67P Comet",,, 500, 400,%WS_OverlappedWindow To hDlg
    Control Add Label, hdlg, %ID_Label,"",110,10,100,100, %WS_Child Or %WS_Visible Or %SS_Sunken Or %SS_Notify
    Control Add Option, hdlg, 505,"Diffuse Light",10,110,100,20
    Control Add Option, hdlg, 506,"Ambient Light",10,130,100,20
    Control Add Option, hdlg, 507,"Diff + Ambient Light",10,150,100,20
    Control Set Option  hDlg, 505, 506, 507
    Dialog Show Modal hdlg Call dlgproc
End Function
'---------------------------------------------------------------------'
CallBack Function dlgproc()
    Local pt As Point
    Local XDelta, YDelta As Single
    Static SpinInWork,XLast,YLast As Long
     Select Case Cb.Msg
       Case %WM_InitDialog : GetRenderContext
          InitializeScene
          SetTimer(hDlg, %ID_Timer, 50, %NULL)
          ScaleFactor = 1
          Readmodel
       Case %WM_Command    : If Cb.Ctl > 504 And Cb.Ctl < 506 Then DrawScene 0,0,0
       Case %WM_Timer      : DrawScene 0,0.5,0 'redraw with rotation on y-axiss
       Case %WM_Paint      : DrawScene 0,0,0  'redraw with no rotation
       Case %WM_Size       : Control Set Size hDlg, %ID_Label, Lo(Word, Cb.LParam)-120, Hi(Word, Cb.LParam)-20
          ResizeScene Lo(Word, Cb.LParam)-120, Hi(Word, Cb.LParam)-20
          DrawScene 0,0,0  'redraw with no rotation
       Case %WM_Close      : wglmakecurrent %null, %null 'unselect rendering context
          wgldeletecontext hRC        'delete the rendering context
          releasedc hDlg, hDC         'release device context
       Case %WM_MouseWheel
          Select Case Hi(Integer,Cb.WParam)
             Case > 0  : ScaleFactor = ScaleFactor + 0.1 : DrawScene 0,0,0
             Case < 0  : ScaleFactor = ScaleFactor - 0.1 : DrawScene 0,0,0
          End Select
       Case %WM_SetCursor
          GetCursorPos pt          'p.x and p.y are in screen coordinates
          ScreenToClient hDlg, pt  'p.x and p.y are now dialog client coordinates
          If GetDlgCtrlID(ChildWindowFromPoint( hDlg, pt )) <> %ID_Label Then Exit Function
          Select Case Hi(Word, Cb.LParam)
             Case %WM_LButtonDown
                GetCursorPos pt              'pt has xy screen coordinates
                ScreenToClient hDlg, pt       'pt now has dialog client coordinates
                If pt.y < 0 Then Exit Select
                KillTimer Cb.Hndl, %ID_Timer
                SpinInWork = 1
                XLast = Pt.x
                YLast = Pt.y
             Case %WM_MouseMove
                If SpinInWork Then
                   GetCursorPos pt           'pt has xy screen coordinates
                   ScreenToClient hDlg, pt    'pt now has dialog client coordinates
                   If pt.y < 0 Then Exit Select
                   XDelta = XLast - Pt.x
                   YDelta = YLast - Pt.y
                   DrawScene -YDelta, -XDelta, 0
                   XLast = pt.x
                   YLast = pt.y
                End If
             Case %WM_LButtonUp
                SpinInWork = 0
                SetTimer(hDlg, %ID_Timer, 50, %NULL)
          End Select
    End Select
End Function
'---------------------------------------------------------------------'
Sub GetRenderContext
    Local pfd As PIXELFORMATDESCRIPTOR   'pixel format properties for device context
    pfd.nSize       =  SizeOf(PIXELFORMATDESCRIPTOR)
    pfd.nVersion    =  1
    pfd.dwFlags     = %pfd_draw_to_window Or %pfd_support_opengl Or %pfd_doublebuffer
    pfd.dwlayermask = %pfd_main_plane
    pfd.iPixelType  = %pfd_type_rgba
    pfd.ccolorbits  = 24
    pfd.cdepthbits  = 24
     Control Handle hdlg, %ID_Label To hLabel
    hDC = GetDC(hLabel)
    SetPixelFormat(hDC, ChoosePixelFormat(hDC, pfd), pfd)  'set properties of device context
    hRC = wglCreateContext (hDC)                           'get rendering context
    wglMakeCurrent hDC, hRC                                'make the RC current
End Sub
'---------------------------------------------------------------------'
Sub InitializeScene
    glClearColor 0,0,0,0     'sets color to be used with glClear
    glClearDepth 1           'sets zvalue to be used with glClear
    Dim LightDiffuse(3) As Single:  Array Assign LightDiffuse()  = 1.0, 0.9, 0.9, 1.0
    Dim LightAmbient(3) As Single:  Array Assign LightAmbient()  = 0.3, 0.3, 0.3, 1.0
    Dim LightPosition(3) As Single: Array Assign LightPosition() = 5.0, 5.0, 5.0, 1.0
    Call glLightfv(%GL_LIGHT0, %GL_DIFFUSE, LightDiffuse(0))     ' Setup The Diffuse Light
    Call glLightfv(%GL_LIGHT0, %GL_POSITION,  LightPosition(0))  ' Position The Light
    Call glLightfv(%GL_LIGHT1, %GL_Ambient, LightAmbient(0))     ' Setup The Ambient Light
    Call glEnable(%GL_LIGHT0)                                    ' Enable Light Zero
    Call glEnable(%GL_LIGHT1)                                    ' Enable Light One
    Call glEnable(%GL_LIGHTING)                                  ' Enable Lighting
    Call glEnable(%GL_COLOR_MATERIAL)                            ' Enable Coloring Of Material
    Call glColorMaterial(%GL_FRONT And %GL_BACK, %GL_AMBIENT_AND_DIFFUSE)
     glDepthFunc %gl_less                                'specify how depth-buffer comparisons are made
    glEnable %gl_depth_test                             'enable depth testing
    glShadeModel %gl_nicest '%gl_smooth                 'smooth shading or nicest
    glHint %gl_perspective_correction_hint, %gl_nicest  'best quality rendering
End Sub
'---------------------------------------------------------------------'
Sub ResizeScene (w As Long, h As Long)
    glViewport 0, 0, w, h             'resize viewport to match window size
    glMatrixMode %gl_projection       'select the projection matrix
    glLoadIdentity                    'reset the projection matrix
    gluPerspective 45, w/h, 0.1, 100  'calculate the aspect ratio of the Window
    glMatrixMode %gl_modelview        'select the modelview matrix
End Sub
'---------------------------------------------------------------------'
Sub DrawScene (dx As Single, dy As Single, dz As Single)
    Static anglex, angley, anglez As Single
    Local i,j,k  As Long
    For i = 1 To 3
       Control Get Check hDlg, 504+i To j
       If j = %True Then Exit For
    Next i
     glClear %gl_color_buffer_bit Or %gl_depth_buffer_bit  'clear buffers
    glLoadIdentity                                        'clear the modelview matrix
    gluLookAt 0,0,10,0,0,0,0,1,0
     glScalef scalefactor, scalefactor, scalefactor
     anglex = anglex + dx : glRotatef anglex, 1,0,0
    angley = angley + dy : glRotatef angley, 0,1,0
    anglez = anglez + dz : glRotatef anglez, 0,0,1
     Select Case i
    Case 1
       Call glEnable(%GL_LIGHT0)                                    ' Enable Light Zero
       Call glDisable(%GL_LIGHT1)                                   ' Disable Light One
       Call glEnable(%GL_LIGHTING)                                  ' Enable Lighting
    Case 2
       Call glEnable(%GL_LIGHT1)                                    ' Enable Light One
       Call glDisable(%GL_LIGHT0)                                   ' Disable Light Zero
       Call glEnable(%GL_LIGHTING)
    Case 3
       Call glEnable(%GL_LIGHT1)                                    ' Enable Light One
       Call glEnable(%GL_LIGHT0)                                    ' Enable Light Zero
       Call glEnable(%GL_LIGHTING)
    End Select
     For k=1 To faces&                                   'here the "drawing" is done
          glBegin %gl_triangles
          glcolor3ub coltex(k),coltex(k),coltex(k)      '"false" colors
          glNormal3f(fn(k,1),fn(k,3),fn(k,3))           'normals in order to allow shading effects
          glvertex3f  x(f(k,1)),y(f(k,1)),z(f(k,1))     'vertex1
          glvertex3f  x(f(k,2)),y(f(k,2)),z(f(k,2))     'vertex2
          glvertex3f  x(f(k,3)),y(f(k,3)),z(f(k,3))    'vertex3
          glEnd
     Next k
     SwapBuffers hDC              'display the buffer (image)
End Sub
'---------------------------------------------------------------------'
Sub Readmodel                               'select file , open , read and convert to coordinates, faces, texture
    Local inputfile$,dummy$,l$,ll$
    Local i&,nr&
    Local ax,ay,az,bx,by,bz,sq  As Single
    Local maxx                  As Single
     ReDim x(400000),y(400000),z(400000)     'vertex coordinates
    ReDim f(380000,3),fn(380000,3)          'faces and normals
    ReDim coltex(380000)                    'colored texture
    'Two possible inputfiles are coded to open
    'inputfile$="ESA_Rosetta_OSIRIS_67P_SHAP2P.obj"
        'Inputfile is the .obj file : http://sci.esa.int/rosetta/54728-sha...-of-comet-67p/
    'inputfile$="67P_C-G_shapemodel_Malmer_2015_02_03.obj"
        'Inputfile is the .obj file :http://mattias.malmer.nu/category/rosetta/
    'Both inputfiles need special attention !
    Display Openfile 0, 100, 30, "Select the .obj  file ", _
            "", Chr$("obj", 0, "*.obj", 0), "", _
            "", %OFN_FileMustExist To  inputfile$
     vertices&=0:faces&=0
    If InStr(inputfile$,"Malmer")>0  Then
        Open inputfile$ For Input As #1
        While IsFalse Eof(#1)
        'Format of Input : lists of vertices and faces
        'v 0.183863 -0.251854 -0.337678
        'f 14327 6959 18747
        Line Input #1,dummy$
        l$=Left$(dummy$,1)
        If l$="v" Then
            vertices&=vertices&+1
            ll$=Clip$(Left  dummy$, 3)
            x(vertices&)=Val (Parse$(ll$ , Any " ", 1))
            y(vertices&)=Val (Parse$(ll$ , Any " ", 2))
            z(vertices&)=Val (Parse$(ll$ , Any " ", 3))
            End If
        If l$="f" Then
            faces&=faces&+1
            f(faces&,1)=Val (Parse$(dummy$ , Any " ", 2))
            f(faces&,2)=Val (Parse$(dummy$ , Any " ", 3))
            f(faces&,3)=Val (Parse$(dummy$ , Any " ", 4))
            End If
        Wend
        Close #1
    End If
     If InStr(inputfile$,"Rosetta")>0  Then
        Open inputfile$ For Input As #1
        While IsFalse Eof(#1)
        'Format of Input : lists of vertices and faces
        'v 0.183863 -0.251854 -0.337678
        'f 14327 6959 18747
        Line Input #1,dummy$
        l$=Left$(dummy$,1)
        If l$="v" Then
            vertices&=vertices&+1
            x(vertices&)=Val (Parse$(dummy$ , Any " ", 2))
            y(vertices&)=Val (Parse$(dummy$ , Any " ", 3))
            z(vertices&)=Val (Parse$(dummy$ , Any " ", 4))
            End If
        If l$="f" Then
            faces&=faces&+1
            f(faces&,1)=Val (Parse$(dummy$ , Any " ", 2))
            f(faces&,2)=Val (Parse$(dummy$ , Any " ", 3))
            f(faces&,3)=Val (Parse$(dummy$ , Any " ", 4))
            End If
        Wend
        Close #1
    End If
    ' Do some scaling in x-direction
    For i&=1 To vertices&
        maxx=Max(Abs(x(i&)),maxx)
    Next i&
    For i&=1 To vertices&
        x(i&)=x(i&)/maxx
        y(i&)=y(i&)/maxx
        z(i&)=z(i&)/maxx
    Next i&
    'calculating normals according to this formula  ( see : OpenGl Wiki )
        'a.x = p2.x - p1.x;
        'a.y = p2.y - p1.y;
        'a.z = p2.z - p1.z;
        'b.x = p3.x - p1.x;
        'b.y = p3.y - p1.y;
        'b.z = p3.z - p1.z;
        'n.x = (a.y * b.z) - (a.z * b.y);
        'n.y = (a.z * b.x) - (a.x * b.z);
        'n.z = (a.x * b.y) - (a.y * b.x);
        '// Normalize (divide by root of dot product)
        'l = sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
        'n.x /= l;
        'n.y /= l;
        'n.z /= l;
    For i&=1 To faces&
        ax= x(f(i&,2))-x(f(i&,1))
        ay= y(f(i&,2))-y(f(i&,1))
        az= z(f(i&,2))-z(f(i&,1))
        bx= x(f(i&,3))-x(f(i&,1))
        by= y(f(i&,3))-y(f(i&,1))
        bz= z(f(i&,3))-z(f(i&,1))
        fn(i&,1)= (ay*bz)-(az*by)
        fn(i&,2)= (az*bx)-(ax*bz)
        fn(i&,3)= (ax*by)-(ay*bx)
        sq=Sqr((fn(i&,1))^2+(fn(i&,2))^2+(fn(i&,3))^2)
        fn(i&,1)=fn(i&,1)/sq
        fn(i&,2)=fn(i&,2)/sq
        fn(i&,3)=fn(i&,3)/sq
    Next i&
    'Finally Generating sort of  color (false texture) related to the normal of the local surface
    For i&=1 To faces&
        coltex(i&) =200-50*(Abs(fn(i&,1)+fn(i&,2))-(fn(i&,3)))
    Next i&
End Sub
'---------------------------------------------------------------------'
'fk derived from gbs_00586 Date: 03-10-2012
