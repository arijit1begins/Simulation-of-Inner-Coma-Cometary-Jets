/******************************************************
 *Particle System                                     *
 *Controlls:                                          *
 *    1 : Smoke simulation                            *
 *    2 : Water fountain simulation                   *
 *    3 : Fire simulation                             *
 *    4 : Fire with smoke simulation                  *
 *  +/- : Increase/decrease wind strength             *
 *  [/] : Increase/decrease gravity                   *
 *  Esc : Exit the program                            *
 ******************************************************/
 /*****************************************************
 * main.cpp                                           *
 *    This file contains the code necessary to        *
 *    initalize and use OpenGL, load textures, and    *
 *    display the particles contained in              *
 *    particleSystem.                                 *
 * Requires:                                          *
 *    System.h System.cpp                             *
 *    particle.raw particle_mask.raw                  *
 ******************************************************/
#include <glut.h>
#include <windows.h>
#include <stdio.h>
#include <math.h>
#include <ctime>
#include "System.h"


float zoom;
System particleSystem;
System particleSystem1;
System particleSystem2;
System particleSystem3;

// texture related globals
GLfloat texture[10];
GLuint LoadTextureRAW( const char * filename, int width, int height);
void FreeTexture( GLuint texturez );

void DrawParticles (void)
{
   int i;
   for (i = 1; i < particleSystem.getNumOfParticles(); i++)
   {
      glPushMatrix();
      // set color and fade value (alpha) of current particle
      glColor4f(particleSystem.getR(i), particleSystem.getG(i), particleSystem.getB(i), particleSystem.getAlpha(i));
      // move the current particle to its new position
      glTranslatef(particleSystem.getXPos(i), particleSystem.getYPos(i), particleSystem.getZPos(i) + zoom);
      // rotate the particle (this is proof of concept for when proper smoke texture is added)
      glRotatef (particleSystem.getDirection(i) - 90, 0, 0, 1);
      // scale the current particle (only used for smoke)
      glScalef(particleSystem.getScale(i), particleSystem.getScale(i), particleSystem.getScale(i));

      glDisable (GL_DEPTH_TEST);
      glEnable (GL_BLEND);

      glBlendFunc (GL_DST_COLOR, GL_ZERO);
      glBindTexture (GL_TEXTURE_2D, texture[0]);
      glRotatef(0.09,0,1,0);
      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glBlendFunc (GL_ONE, GL_ONE);
      glBindTexture (GL_TEXTURE_2D, texture[1]);
      //glRotatef(0.09,0,1,0);

      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glEnable(GL_DEPTH_TEST);

      glPopMatrix();
      //Sleep(2);


      glPushMatrix();
      // set color and fade value (alpha) of current particle
      glColor4f(particleSystem1.getR(i), particleSystem1.getG(i), particleSystem1.getB(i), particleSystem1.getAlpha(i));
      // move the current particle to its new position
      glTranslatef(particleSystem1.getXPos(i), particleSystem1.getYPos(i), particleSystem1.getZPos(i) + zoom);
      // rotate the particle (this is proof of concept for when proper smoke texture is added)
      glRotatef (particleSystem1.getDirection(i) - 90, 0, 0, 1);
      // scale the current particle (only used for smoke)
      glScalef(particleSystem1.getScale(i), particleSystem1.getScale(i), particleSystem1.getScale(i));

      glDisable (GL_DEPTH_TEST);
      glEnable (GL_BLEND);

      glBlendFunc (GL_DST_COLOR, GL_ZERO);
      glBindTexture (GL_TEXTURE_2D, texture[0]);
      glRotatef(0.09,0,1,0);
      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glBlendFunc (GL_ONE, GL_ONE);
      glBindTexture (GL_TEXTURE_2D, texture[1]);
      glRotatef(0.09,0,1,0);

      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glEnable(GL_DEPTH_TEST);

      glPopMatrix();

      glPushMatrix();
      // set color and fade value (alpha) of current particle
      glColor4f(particleSystem2.getR(i), particleSystem2.getG(i), particleSystem2.getB(i), particleSystem2.getAlpha(i));
      // move the current particle to its new position
      glTranslatef(particleSystem2.getXPos(i), particleSystem2.getYPos(i), particleSystem2.getZPos(i) + zoom);
      // rotate the particle (this is proof of concept for when proper smoke texture is added)
      glRotatef (particleSystem2.getDirection(i) - 90, 0, 0, 1);
      // scale the current particle (only used for smoke)
      glScalef(particleSystem2.getScale(i), particleSystem2.getScale(i), particleSystem2.getScale(i));

      glDisable (GL_DEPTH_TEST);
      glEnable (GL_BLEND);

      glBlendFunc (GL_DST_COLOR, GL_ZERO);
      glBindTexture (GL_TEXTURE_2D, texture[0]);
      glRotatef(0.09,0,1,0);
      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glBlendFunc (GL_ONE, GL_ONE);
      glBindTexture (GL_TEXTURE_2D, texture[1]);
      //glRotatef(0.09,0,1,0);

      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glEnable(GL_DEPTH_TEST);

      glPopMatrix();
   }

  /* for (i = 1; i < particleSystem1.getNumOfParticles(); i++)
   {
      glPushMatrix();
      // set color and fade value (alpha) of current particle
      glColor4f(particleSystem1.getR(i), particleSystem1.getG(i), particleSystem1.getB(i), particleSystem1.getAlpha(i));
      // move the current particle to its new position
      glTranslatef(particleSystem1.getXPos(i)+0.006, particleSystem1.getYPos(i), particleSystem1.getZPos(i) + zoom);
      // rotate the particle (this is proof of concept for when proper smoke texture is added)
      glRotatef (particleSystem1.getDirection(i) - 90, 0, 0, 1);
      // scale the current particle (only used for smoke)
      glScalef(particleSystem1.getScale(i), particleSystem1.getScale(i), particleSystem1.getScale(i));

      glDisable (GL_DEPTH_TEST);
      glEnable (GL_BLEND);

      glBlendFunc (GL_DST_COLOR, GL_ZERO);
      glBindTexture (GL_TEXTURE_2D, texture[0]);
      glRotatef(0.09,0,1,0);
      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glBlendFunc (GL_ONE, GL_ONE);
      glBindTexture (GL_TEXTURE_2D, texture[1]);
      glRotatef(0.09,0,1,0);

      glBegin (GL_QUADS);
      glTexCoord2d (0, 0);
      glVertex3f (-1, -1, 0);
      glTexCoord2d (1, 0);
      glVertex3f (1, -1, 0);
      glTexCoord2d (1, 1);
      glVertex3f (1, 1, 0);
      glTexCoord2d (0, 1);
      glVertex3f (-1, 1, 0);
      glEnd();

      glEnable(GL_DEPTH_TEST);

      glPopMatrix();
      //Sleep(2);
   }*/
}

void display (void)
{
   glClearDepth (1);
   glClearColor (0.0,0.0,0.0,1.0);
   glClear (GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
   glLoadIdentity();
   glTranslatef (0,0,-10);

   particleSystem.updateParticles();
   particleSystem1.updateParticles();
   particleSystem2.updateParticles();
   DrawParticles();

   glutSwapBuffers();
}

void init (void)
{
	glEnable( GL_TEXTURE_2D );
	glEnable(GL_DEPTH_TEST);

   zoom = -80.0f;
   particleSystem.setSystemType(1);
   particleSystem1.setSystemType(2);
   particleSystem2.setSystemType(3);
   particleSystem.createParticles();
   particleSystem1.createParticles();
   particleSystem2.createParticles();

	texture[0] = LoadTextureRAW( "particle_mask.raw",256,256); //load alpha for texture
	texture[1] = LoadTextureRAW( "particle.raw",256,256); //load texture
}

//Called when a key is pressed
void handleKeypress(unsigned char key, int x, int y)
{
	switch (key)
   {
      case 49: //1 key: smoke
         //zoom = -80.0f;
         particleSystem.setSystemType(1);
         particleSystem.createParticles();
         break;
      case 50: //2 key: fountain high
         //zoom = -40.0f;
         particleSystem.setSystemType(2);
         particleSystem.createParticles();
         break;
      case 51: //3 key: fire
         //zoom = -40.0f;
         particleSystem.setSystemType(3);
         particleSystem.createParticles();
         break;
      case 52: //4 key: fire with smoke
         zoom = -60.0f;
         particleSystem.setSystemType(4);
         particleSystem.createParticles();
         break;
      case 61: //+ key: change x pull for more wind to right
         particleSystem.modifySystemPull(0.0005f, 0.0f, 0.0f);
         break;
      case 45: //- key: change x pull for wind wind to left
         particleSystem.modifySystemPull(-0.0005f, 0.0f, 0.0f);
         break;
      case 91: //[ key: change y pull for more gravity
         particleSystem.modifySystemPull(0.0f, 0.0005f, 0.0f);
         break;
      case 93: //] key; change y pull for less gravity
         particleSystem.modifySystemPull(0.0f, -0.0005f, 0.0f);
         break;
      case 97:
        particleSystem1.modifySystemPull(-0.0005f, 0.0f, 0.0f);
        break;
      case 115:
        particleSystem1.modifySystemPull(0.0005f, 0.0f, 0.0f);
        break;
      case 100:
        particleSystem1.modifySystemPull(0.0f, 0.0005f, 0.0f);
        break;
      case 102:
        particleSystem1.modifySystemPull(0.0f, -0.0005f, 0.0f);
        break;
      case 122:
        particleSystem2.modifySystemPull(-0.0005f,0.0f,0.0f);
        break;
      case 120:
        particleSystem2.modifySystemPull(0.0005f, 0.0f, 0.0f);
        break;
      case 99:
        particleSystem2.modifySystemPull(0.0f,0.0005f,0.0f);
        break;
      case 118:
        particleSystem2.modifySystemPull(0.0f,-0.0005,0.0f);
        break;
      case 27: //Escape key
        exit(0);
	}
}

void reshape (int w, int h)
{
	glViewport (0, 0, (GLsizei)w, (GLsizei)h);
	glMatrixMode (GL_PROJECTION);
	glLoadIdentity ();
	gluPerspective (60, (GLfloat)w / (GLfloat)h, 1.0, 100.0);
	glMatrixMode (GL_MODELVIEW);
}

int main (int argc, char **argv)
{
   srand((unsigned int)time(0)); //Seed the random number generator using system time
   glutInit (&argc, argv);
   glutInitDisplayMode (GLUT_DOUBLE | GLUT_RGBA | GLUT_DEPTH);
   glutInitWindowSize (500, 500);
   glutInitWindowPosition (100, 100);
   glutCreateWindow ("Particle System");
   init();
   glutDisplayFunc (display);
   glutIdleFunc (display);
   glutKeyboardFunc(handleKeypress);
   glutReshapeFunc (reshape);
   glutMainLoop ();
   return 0;
}

// Functions to load RAW files
GLuint LoadTextureRAW( const char * filename, int width, int height )
{
  GLuint texture;
  unsigned char * data;
  FILE * file;
  file = fopen( filename, "rb" );
  if ( file == NULL ) return 0;
  data = (unsigned char *)malloc( width * height * 3 );
  fread( data, width * height * 3, 1, file );
  fclose( file );
  glGenTextures(1, &texture );
  glBindTexture(GL_TEXTURE_2D, texture);
  glTexParameteri (GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
  glTexParameteri (GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
  glTexEnvi( GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_MODULATE );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_NEAREST );
  glTexParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
  gluBuild2DMipmaps(GL_TEXTURE_2D, 3, width, height, GL_RGB, GL_UNSIGNED_BYTE, data);
  free( data );
  return texture;
}

void FreeTexture( GLuint texture )
{
  glDeleteTextures( 1, &texture );
}




