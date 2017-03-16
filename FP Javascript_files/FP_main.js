

var $, document;

var inputType = 0; //default is "custom"

// switch between different input styles
function switchOE(type)
{
    if(type===0)
    {
        document.getElementById("inputOE_Horizons").style.display='none';
        document.getElementById("inputOE_custom").style.display='block';
        inputType = 0;
    }
    else
    {
        document.getElementById("inputOE_custom").style.display='none';
        document.getElementById("inputOE_Horizons").style.display='block';
        document.getElementById("objectName").value = "";
        inputType = 1;
    }
}

// input
var objectName;
var e, q, inc, OM, w, Tp;
var listSynchrones, listBeta, Tobs;

// output
var synchrones, syncLabelsPos, syncLabels;
var syndynes, syndLabelsPos, syndLabels;
var xlim, ylim;

xlim = [0, 24];
ylim = [-90, 90];


var mainStyle =
{
  xaxis:
  {
    transform: function(v){ return -v;},
    min: xlim[0],
    max: xlim[1]
  },
  yaxis:
  {
    min: ylim[0],
    max: ylim[1]
  },
  series:
  {
    color: "#000000",
    shadowSize: 0
  },
  xaxes:
  [{
    axisLabelUseCanvas:true,
    axisLabelPadding:10,
    axisLabel: "RA [h]"
  }],
  yaxes:
  [{
    axisLabelUseCanvas:true,
    axisLabelPadding:10,
    axisLabel: "DEC [deg]",
    position: "left"
  }],
  imageClassName: "canvas-image",
  imageFormat: "png"
};

$(document).ready(
    function()
    {
        $.plot("#placeholder", [], mainStyle );
    }
);


/*--------------*/
/* CALCULATIONS */
/*--------------*/
function printOut(str)
{
    document.getElementById("output").value += str;
    var textarea = document.getElementById("output");
    textarea.scrollTop = textarea.scrollHeight;
}

function date2jd(year, month, day)
{
    var a = Math.floor((14 - month)/12);
    var y = year + 4800 - a;
    var m = month + 12*a - 3;
    
    // remove 0.5 because JDs start at noon, not at midnight
    var jd = day -0.5 + Math.floor((153*m + 2)/5) + y*365 +
       Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045;
    
    return jd;
}

function FPDiagram()
{
    var outputStr;
    var objectName, e, q, inc, OM, w, Tp, ephem, RAc, DECc;
    var sunPos_g, Rs, Ls;
    var tt, nbSynchrones;
    var ss, nbSyndynes;
    var pArrayP; // array of particle positions in the photographic plane
    var Temi, frogStep, tevol, pBeta, pPositionH, npPosH, pSunDirH, pAlphaH;
    var cometPosH, ncPosH, tmpVec;
    var dr, dv, da;
    var x,y,z, xeq,yeq,zeq, delta, RA, DEC;
    var mu = 3.964e-14; //AU^3.s^-2 = 1.327e20; % m^3.s^-2
    var epsilon = 23.4392911111111; // mean obliquity of the ecliptical plane
    var PASun, PAVel, PsAng, PsAMV;
    
    // reset output panel
    document.getElementById("output").value = "";
    
    // read input and display summary
    objectName = document.getElementById("objectName").value;
    printOut("Object Name: " + objectName + "\n\n");

    // Orbital elements are read differently depending on the input type
    if(inputType===0)
    {    
        e = parseFloat(document.getElementById("e").value);
        q = parseFloat(document.getElementById("q").value);
        inc = parseFloat(document.getElementById("i").value);
        OM = parseFloat(document.getElementById("OM").value);
        w = parseFloat(document.getElementById("w").value);
        Tp = parseFloat(document.getElementById("Tp").value);
    }
    else
    {
        OEHorizons = document.getElementById("inputHorizons").value.match(/\S+/g);
        var index;
        for(index=0; index<OEHorizons.length; index++)
        {
            if(OEHorizons[index]==="EC="){ e = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="QR="){ q = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="IN="){ inc = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="OM="){ OM = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="W="){ w = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="W"){ w = parseFloat(OEHorizons[index+2]); } // sometimes there is a space after the W
            if(OEHorizons[index]==="Tp="){ Tp = parseFloat(OEHorizons[index+1]); }
            if(OEHorizons[index]==="TP="){ Tp = parseFloat(OEHorizons[index+1]); }
        }
    }
    
    outputStr = "Orbital elements:\n" + 
              "e= " + e + "\n" +
              "q= " + q + "\n" +
              "i= " + inc + "\n" +
              "OM= " + OM + "\n" +
              "w= " + w + "\n" +
              "Tp= " + Tp + "\n\n";
    printOut(outputStr);
    
    printOut("Synchrones: ");
    listSynchrones = document.getElementById("synchrones").value.split(",");
    syncLabels = listSynchrones;
    nbSynchrones = listSynchrones.length;
    for(tt=0; tt<nbSynchrones; tt++) 
    {
        listSynchrones[tt] = parseFloat(listSynchrones[tt]);
        printOut(listSynchrones[tt]+" ");
    }
    
    printOut("\nSyndynes: ");
    listBeta = document.getElementById("beta").value.split(",");
    syndLabels = listBeta;
    nbSyndynes = listBeta.length;
    for(ss=0; ss<nbSyndynes; ss++)
    {
        listBeta[ss] = parseFloat(listBeta[ss]);
        printOut(listBeta[ss]+" ");
    }
    
    frogStep = parseFloat(document.getElementById("frogstep").value);
    outputStr = "\nIntegration step: " + frogStep + " days, " + (frogStep*86400) + " seconds.";
    printOut(outputStr);
    
    Tobs = document.getElementById("Tobs").value.split(",");
    Tobs = date2jd(parseFloat(Tobs[0]), parseFloat(Tobs[1]), parseFloat(Tobs[2]));
        
    outputStr = "\n\n" + 
            nbSynchrones + " synchrones and " + 
            nbSyndynes + " syndynes will be calculated at Tobs = " + 
            Tobs + " JD.\n\n";
    printOut(outputStr);
    
    // Calculate ephemeris
    ephem = ephemeris(e, q, inc, OM, w, Tp, Tobs);
    //ephem = [Tobs, r, delta, RA, DEC, PsAng, PsAMV];
    RAc = ephem[3][3];
    DECc = ephem[4][3];
    
    // geocentric ecliptical coordinates of the Sun at Tobs
    sunPos_g = sunCoord(Tobs);
    Rs = sunPos_g[0];
    Ls = sunPos_g[1];
    
    outputStr = "Ephemeris:\n"+
            "r= " + ephem[1].toFixed(2) + " AU\n" +
            "delta= " + ephem[2].toFixed(2) + " AU\n" +
            "RA= " + ephem[3][0]+"h "+ephem[3][1]+"min "+ephem[3][2]+"s\n" +
            "DEC= " + ephem[4][0]+"\xB0 "+ephem[4][1]+"' "+ephem[4][2]+"\"\n" +
            "PsAng= " + ephem[5].toFixed(2) + "\xB0\n" +
            "PsAMV= " + ephem[6].toFixed(2) + "\xB0\n";
    printOut(outputStr);
    
    // Calculate FP diagram
    frogStep *= 86400.0;   // converts to seconds
    
    pArrayP = [];
    
    //for each syndyne
    for(ss = 0; ss<nbSyndynes; ss++)
    {
        //var ss_index = ss+1;
        //printOut("Syndyne "+ ss_index +"/"+nbSyndynes+"\n");
    
        pBeta = listBeta[ss];
        
        pArrayP[ss] = [];
        
        // for each synchrone
        for(tt = 0; tt<nbSynchrones; tt++)
        {
            //var tt_index = tt+1;
            //printOut("\tSynchrone "+ tt_index +"/"+nbSynchrones+"\n");
            
            Temi = Tobs-listSynchrones[tt];
        
            cometPosH = posHelio(e, q, inc, OM, w, Tp, Temi);
    
            // initial position in heliocentric frame
            pPositionH = cometPosH; // AU
            pSunDirH = vectMult(pPositionH, -1/norm(pPositionH));
            
            // alpha = perturbing acceleration due to solar radiation pressure
            //       = -beta * mu / r^2
            npPosH = norm(pPositionH);
            pAlphaH = vectMult( pSunDirH, -pBeta*mu/(npPosH*npPosH) ); // AU.s^-2
            
            // we follow dr, the vector osculating orbit => grain position
            // initialization at Temi
            dr = [0, 0, 0];
            dv = [0, 0, 0];
            ncPosH = norm(cometPosH);
            tmpVec = vectMult( cometPosH, 1/(ncPosH*ncPosH*ncPosH) );
            tmpVec = vectSubtract( tmpVec, vectMult( pPositionH, 1/(npPosH*npPosH*npPosH) ) );
            da = vectAdd( pAlphaH, vectMult(tmpVec, mu) );
            
            // evolution until Tobs
            for(tevol = Temi+frogStep/86400.0; tevol<=Tobs; tevol+=frogStep/86400.0)
            {
                dr = vectAdd(dr, vectMult(dv,frogStep));
                dr = vectAdd(dr, vectMult(da, frogStep*frogStep/2));
                dv = vectAdd(dv, vectMult(da,frogStep));
    
                cometPosH = posHelio(e, q, inc, OM, w, Tp, tevol);
                pPositionH = vectAdd(cometPosH, dr);
                
                // update acceleration
                pSunDirH = vectMult(pPositionH, -1/norm(pPositionH));
                npPosH   = norm(pPositionH);
                pAlphaH  = vectMult(pSunDirH, -pBeta*mu/(npPosH*npPosH));
                ncPosH = norm(cometPosH);
                tmpVec = vectMult( cometPosH, 1/(ncPosH*ncPosH*ncPosH) );
                tmpVec = vectSubtract( tmpVec, vectMult( pPositionH, 1/(npPosH*npPosH*npPosH) ) );
                da = vectAdd( pAlphaH, vectMult(tmpVec, mu) );
            }
            
            // convert heliocentric position to [RA, DEC] at Tobs
            // geocentric eccliptic rectangular coordinates of the grain
            x = pPositionH[0] + Rs*cosd(Ls);
            y = pPositionH[1] + Rs*sind(Ls);
            z = pPositionH[2];
            delta = Math.sqrt(x*x + y*y + z*z);
            
            // Geocentric equatorial coordinates of the grain
            xeq = x;
            yeq = y*cosd(epsilon) - z*sind(epsilon);
            zeq = y*sind(epsilon) + z*cosd(epsilon);
            
            // RA and DEC
            RA = atan2d(yeq,xeq);
            if(RA<=0){ RA += 360; }
            RA = RA/15;
            DEC = asind(zeq/delta);
            
            // save result
            pArrayP[ss][tt] = [RA, DEC];

        }// end synchrones
    }// end syndynes
        
    
    /* Generate specific arrays of synchrones and syndynes for the plot
        synchrones, syncLabelsPos, syncLabels;
        syndynes, syndLabelsPos, syndLabels;
        xlim, ylim; */
    xlim = [24, 0];
    ylim = [90, -90];

    synchrones = [];
    syncLabelsPos = [];
    for(tt=0; tt<nbSynchrones; tt++)
    {
        synchrones[tt*3] = [RAc, DECc];
        synchrones[tt*3+1] = [ pArrayP[nbSyndynes-1][tt][0], pArrayP[nbSyndynes-1][tt][1] ];
        synchrones[tt*3+2] = null;
        
        syncLabelsPos[tt] = synchrones[tt*3+1];
    }
    
    syndynes = [];
    syndLabelsPos = [];
    for(ss=0; ss<nbSyndynes; ss++)
    {
        for(tt=1; tt<nbSynchrones; tt++)
        {
            syndynes[ss*nbSynchrones+tt] = [ pArrayP[ss][tt][0], pArrayP[ss][tt][1] ];
            if(syndynes[ss*nbSynchrones+tt][0]<xlim[0]){ xlim[0]=syndynes[ss*nbSynchrones+tt][0];}
            if(syndynes[ss*nbSynchrones+tt][0]>xlim[1]){ xlim[1]=syndynes[ss*nbSynchrones+tt][0];}
            if(syndynes[ss*nbSynchrones+tt][1]<ylim[0]){ ylim[0]=syndynes[ss*nbSynchrones+tt][1];}
            if(syndynes[ss*nbSynchrones+tt][1]>ylim[1]){ ylim[1]=syndynes[ss*nbSynchrones+tt][1];}
        }
        syndynes[ss*nbSynchrones+nbSynchrones] = null;
        syndLabelsPos[ss] = [ pArrayP[ss][nbSynchrones-1][0], pArrayP[ss][nbSynchrones-1][1] ];
    }
    
    // the plot window should be slightly larger than the plot, and
    // we need to adjust the axes so that they cover the same amount of degrees
    // to avoid any distorsion, keeping into account the fact that 1h = 15deg
    var xsize_deg = (xlim[1]-xlim[0])*15 *1.2;
    var ysize_deg = (ylim[1]-ylim[0]) *1.2;

    if(xsize_deg>ysize_deg){ ysize_deg = xsize_deg; }
    else{ xsize_deg = ysize_deg; }
    
    mainStyle.xaxis.min = (xlim[0]+xlim[1])/2 -xsize_deg/(2*15);
    mainStyle.xaxis.max = (xlim[0]+xlim[1])/2 +xsize_deg/(2*15);
    mainStyle.yaxis.min = (ylim[0]+ylim[1])/2 -ysize_deg/2;
    mainStyle.yaxis.max = (ylim[0]+ylim[1])/2 +ysize_deg/2;
        
    /* Sun and velocity vector */
    PsAng = ephem[5];
    PsAMV = ephem[6];
    
    var sunDir=[xsize_deg/(15*10)*sind(PsAng+180), ysize_deg/10*cosd(PsAng+180)];
    var velDir = [xsize_deg/(15*10)*sind(PsAMV+180), ysize_deg/10*cosd(PsAMV+180)];
            
    /* Update plot */
    $.plot("#placeholder", [
            {   //SYNCHRONES
                data: synchrones,
                label: "Synchrones",
                lines: {show: true}
            },
            {   //SYNDYNES
                data: syndynes,
                label: "Syndynes",
                dashes: {show: true},
                color: "#888888"
            },
            {   //SYNCHRONES LABELS
                data: syncLabelsPos,
                canvasRender: true,
                cColor: "#000000",
                cFont: "12pt san-serif",
                lines: {show: false},
                labels: syncLabels,
                showLabels: true,
                labelPlacement: "left"
            },
            {   //SYNDYNES LABELS
                data: syndLabelsPos,
                canvasRender: true,
                cColor: "#888888",
                cFont: "italic 12pt san-serif",
                lines: {show: false},
                labels: syndLabels,
                showLabels: true,
                labelPlacement: "right",
                labelClass: "labelItalic"
            },
            {   //SUN VECTOR
                data: [[RAc, DECc], [RAc+sunDir[0], DECc+sunDir[1]]],
                label: "Sun",
                lines: {show:true},
                color: "#ffa500"
            },
            {   //VEL VECTOR
                data: [ [RAc, DECc], [RAc+velDir[0], DECc+velDir[1]] ],
                label: "Velocity",     
                lines: {show:true},
                color: "#0000ff"
            }
        ],
        mainStyle );
        
}

