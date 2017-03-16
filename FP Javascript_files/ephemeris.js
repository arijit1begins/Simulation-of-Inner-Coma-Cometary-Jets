

var PI = Math.PI;


/*------------------------------------*/
/* Trigonometric functions in degrees */
/*------------------------------------*/
function cosd(a)
{
    return Math.cos(a*PI/180);
}
function acosd(a)
{
    return Math.acos(a)*180/PI;
}
function sind(a)
{
    return Math.sin(a*PI/180);
}
function asind(a)
{
    return Math.asin(a)*180/PI;
}
function tand(a)
{
    return Math.tan(a*PI/180);
}
function atand(a)
{
    return Math.atan(a) * 180/PI;
}
function atan2d(y,x)
{
    return Math.atan2(y,x) * 180/PI;
}


/*----------------------*/
/* 3D vector operations */
/*----------------------*/
function vectMult(A,k)
{
    //returns A * factor
    return [ A[0]*k, A[1]*k, A[2]*k ];
}
function vectSubtract(A,B)
{
    //returns A-B
    return [ A[0]-B[0], A[1]-B[1], A[2]-B[2] ];
}
function vectAdd(A,B)
{
    //returns A+B
    return [ A[0]+B[0], A[1]+B[1], A[2]+B[2] ];
}
function dot(A,B)
{
    // dot product A.B
    return A[0]*B[0] + A[1]*B[1] + A[2]*B[2];
}
function cross(A,B)
{
    // cross product AxB
    return [ A[1]*B[2] - B[1]*A[2],
             B[0]*A[2] - A[0]*B[2],
             A[0]*B[1] - B[0]*A[1] ];
}
function norm(A)
{
    // norm of vector
    return Math.sqrt( A[0]*A[0] + A[1]*A[1] + A[2]*A[2] );
}
function anglev(A,B)
{
    // angle in degrees between A and B
    return acosd( dot(A,B) / (norm(A)*norm(B)) );
}


/*-----------------*/
/* Extra functions */
/*-----------------*/
function cbrt(x)
{
    /* cubic root */
    if(x>=0)
    {
        return Math.pow(Math.abs(x),1/3); 
    }
    else
    {
        return -Math.pow(Math.abs(x),1/3);
    }
}
function fix(x)
{
    /* integer part of a float */
    if(x>0)
    {
        return Math.floor(x); 
    }
    else
    {
        return Math.ceil(x); 
    }
}


/*---------------------------------*/
/* Conversion cartesian to spheric */
/*---------------------------------*/
function vect2sph(A)
{
    var B = [0,0];
    if(A[1]>=0)
    {
        B[1] = acosd( A[0]/Math.sqrt(A[0]*A[0] + A[1]*A[1]) ); 
    }
    else
    {
        B[1] = - acosd( A[0]/Math.sqrt(A[0]*A[0] + A[1]*A[1]) ); 
    }
    if(A[0]*A[0] + A[1]*A[1] === 0)
    {
        B[1] = 0.0; 
    }
    B[0] = atand( A[2]/Math.sqrt(A[0]*A[0] + A[1]*A[1]) );
    return B;
}


/*-------------------------------------------------*/
/* Solving Kepler's equation for an elliptic orbit */
/*-------------------------------------------------*/
function kepler(M, e)
{
    // Input: Mean anomaly in degrees, eccentricity
    // Output: eccentric anomaly in degrees
    // important: input and output in degrees, but calculation in radians !

    var E0, E;

    M = M*PI/180;
    E0=M;
    E = M + e*Math.sin(E0);

    while(Math.abs(E-E0) > 1e-9)
    {
        E0 = E;
        E = M + e*Math.sin(E0);
    }

    //Format the answer so that it is between 0 and 2PI
    E = E % 360;
    return E*180/PI;
}


/*---------------------------------------------------*/
/* Solving Kepler's equation for an hyperbolic orbit */
/*---------------------------------------------------*/
function hyperbolicOrbit(q, e, deltaT)
{
    /*
    solves the iterative equation for the parameter s in Jean Meeus'book
    for an hyperbolic orbit (Chapter 34, page 230)
          QR = perihelion distance in AU
      deltaT = Tobs - Tperihelion */

    var Q1, G, Q2, S, S0, Z, Y, G1, Q3, F, Z1, S1;
    var k = 0.01720209895; // Gauss' gravitational constant

    Q1 = k*Math.sqrt((1+e)/q)/(2*q);
    G = (1-e)/(1+e);

    Q2 = Q1*deltaT;
    S = 2/(3*Math.abs(Q2));
    S = 2/Math.tan(2*Math.atan( cbrt( Math.tan(Math.atan(S)/2) ) ) );
    if(deltaT<0)
    {
        S = -S;
    }

    S0=S;
    Z=1;
    Y=S*S;
    G1=-Y*S;
    Q3 = Q2+2*G*S*Y/3;

    Z=Z+1;
    G1=-G1*G*Y;
    Z1=(Z-(Z+1)*G)/(2*Z+1);
    F=Z1*G1;
    Q3=Q3+F;

    while(Math.abs(F)>1e-9)
    {
        Z=Z+1;
        G1=-G1*G*Y;
        Z1=(Z-(Z+1)*G)/(2*Z+1);
        F=Z1*G1;
        Q3=Q3+F;
    }

    S1=S;
    S=(2*S*S*S/3 + Q3)/(S*S+1);
    while(Math.abs(S-S1)>1e-9)
    {
        S1=S;
        S=(2*S*S*S/3 + Q3)/(S*S+1);
    }
    while(Math.abs(S-S0)>1e-9)
    {
        S0=S;
        Z=1;
        Y=S*S;
        G1=-Y*S;
        Q3 = Q2+2*G*S*Y/3;

        Z=Z+1;
        G1=-G1*G*Y;
        Z1=(Z-(Z+1)*G)/(2*Z+1);
        F=Z1*G1;
        Q3=Q3+F;

        while(Math.abs(F)>1e-9)
        {
            Z=Z+1;
            G1=-G1*G*Y;
            Z1=(Z-(Z+1)*G)/(2*Z+1);
            F=Z1*G1;
            Q3=Q3+F;
        }

        S1=S;
        S=(2*S*S*S/3 + Q3)/(S*S+1);
        while(Math.abs(S-S1)>1e-9)
        {
            S1=S;
            S=(2*S*S*S/3 + Q3)/(S*S+1);
        }
    }
    return S;
}


/*--------------------------------------------*/
/* Geocentric ecliptic coordinates of the Sun */
/*--------------------------------------------*/
function sunCoord(JD)
{
    //From http://www.stjarnhimlen.se/comp/tutorial.html#5

    var d, w, e, M, oblecl, E, x, y, Rs, Vs, Ls; 
    var xeq, yeq, zeq, RAs, DECL;
    var sunPos_g;

    // day
    d = JD - 2451543.5;

    // orbital elements
    w = 282.9404 + 4.70935E-5 * d;   // (longitude of perihelion)
    e = 0.016709 - 1.151E-9 * d;     // (eccentricity)
    M = (356.0470 + 0.9856002585 * d) % 360; // (mean anomaly)

    // obliquity of ecliptic
    oblecl = 23.4393 - 3.563E-7 * d;

    // Eccentric anomaly
    E = M + (180/PI)*e * sind(M) * (1 + e * cosd(M));

    // Sun's rectangular coordinates in the plane of the ecliptic,
    // X points toward perihelion
    x = cosd(E) - e;
    y = sind(E) * Math.sqrt(1 - e*e);

    // distance and true anomaly
    Rs = Math.sqrt(x*x + y*y);
    Vs = atan2d(y,x);

    // longitude of the Sun
    Ls = (Vs + w) % 360;
    if(Ls<0)
    {
        Ls += 360;
    }

    sunPos_g = [Rs, Ls];
    return sunPos_g;
}


/*-----------------------*/
/* coordinate conversion */
/*-----------------------*/
function geo2PA(originEq, vecEq)
{
    /* converts a orbital directional vector
       from    Geocentric Cartesian Ecliptic frame
         to    Position angle measured CCW from north celestial pole
               in photographic plane
    */
    var _originEq, vecPhoto, northPhoto;
    _originEq = vectMult(originEq, -1);

    vecPhoto = cross( _originEq, cross(vecEq, _originEq) );
    northPhoto = cross( _originEq, cross([0, 0, 1], _originEq) );

    if(originEq[0]*vecEq[1] - originEq[1]*vecEq[0] >0)
    {
        return anglev(northPhoto, vecPhoto);
    }
    else
    {
        return -anglev(northPhoto, vecPhoto);
    }
}

function helio2geo(cometPosH, Tobs)
{
    /* converts an orbital position vector:
       from    Heliocentric Cartesian Ecliptic frame
         to    Geocentric Cartesian Equatorial frame
    */
    var sunPos_g, Rs, Ls, x, y, z, xeq, yeq, zeq;
    var epsilon = 23.4392911111111; // mean obliquity of the ecliptical plane

    // geocentric ecliptic coordinates of the Sun
    sunPos_g = sunCoord(Tobs);
    Rs = sunPos_g[0];
    Ls = sunPos_g[1];

    // geocentric ecliptic rectangular coordinates of the comet
    x = cometPosH[0] + Rs*cosd(Ls);
    y = cometPosH[1] + Rs*sind(Ls);
    z = cometPosH[2];

    // Geocentric rectangular equatorial coordinates of the comet
    xeq = x;
    yeq = y*cosd(epsilon) - z*sind(epsilon);
    zeq = y*sind(epsilon) + z*cosd(epsilon);

    return [xeq, yeq, zeq];
}


/*------------------------------------------------------*/
/* Partial ephemeris: heliocentric rectangular position */
/*------------------------------------------------------*/
function posHelio(e, q, inc, OM, w, Tp, Tobs)
{
    var a, Mobs, v, r, E, S, cometPosH;
    var k = 0.01720209895; // Gauss' gravitational constant
    
    //semi-major axis
    a = q/(1-e);

    // mean anomaly at Tobs
    Mobs = (Tobs - Tp) * k / Math.sqrt(Math.abs(a*a*a)) * 180/PI;
    Mobs = Mobs % 360;
    if(Mobs<0){ Mobs += 360; }

    // true anomaly and distance to Sun
    if(e<1)
    {
      // we solve Kepler's equation to get the eccentric anomaly:
      // M = E - e.sin(E)
      E = kepler(Mobs,e);
      v = 2*atand( Math.sqrt((1+e)/(1-e))*tand(E/2) );
    }
    else
    {
      S = hyperbolicOrbit(q, e, Tobs-Tp);
      v = 2*atand(S);
    }
    if(v<0){ v += 360; }
    v = v % 360;
    r = q*(1+e)/(1+e*cosd(v));

    // heliocentric ecliptic rectangular coordinates of the comet
    cometPosH = [ r*(cosd(OM)*cosd(v+w) - sind(OM)*sind(v+w)*cosd(inc)),
                  r*(sind(OM)*cosd(v+w) + cosd(OM)*sind(v+w)*cosd(inc)),
                  r*sind(v+w)*sind(inc) ];

    return cometPosH;
}


/*----------------------------*/
/* Full ephemeris calculation */
/*----------------------------*/
function ephemeris(e, q, inc, OM, w, Tp, Tobs)
{
    var a, Mobs, v, r, E, S;
    var cometPosH, cometPosH_s, L, B;
    var x, y, z, sunPos_g, delta;
    var lambda, beta, Rs, Ls;
    var xeq, yeq, zeq, cometPosEq;
    var RA_, RAH, RA, DEC_, DEC;
    var sunPosEq, RcEq;
    var PASun, PsAng;
    var cometPosH1, cometPosH2, cometPosEq1, cometPosEq2, cometVelEq;
    var PAVel, PsAMV;
    var epsilon = 23.4392911111111; // mean obliquity of the ecliptical plane
    var k = 0.01720209895; // Gauss' gravitational constant
    
    //semi-major axis
    a = q/(1-e);

    // mean anomaly at Tobs
    Mobs = (Tobs - Tp) * k / Math.sqrt(Math.abs(a*a*a)) * 180/PI;
    Mobs = Mobs % 360;
    if(Mobs<0){ Mobs += 360; }

    // true anomaly and distance to Sun
    if(e<1)
    {
      // we solve Kepler's equation to get the eccentric anomaly:
      // M = E - e.sin(E)
      E = kepler(Mobs,e);
      v = 2*atand( Math.sqrt((1+e)/(1-e))*tand(E/2) );
    }
    else
    {
      S = hyperbolicOrbit(q, e, Tobs-Tp);
      v = 2*atand(S);
    }
    if(v<0){ v += 360; }
    v = v % 360;
    r = q*(1+e)/(1+e*cosd(v));

    // heliocentric ecliptic rectangular coordinates of the comet
    cometPosH = [ r*(cosd(OM)*cosd(v+w) - sind(OM)*sind(v+w)*cosd(inc)),
                  r*(sind(OM)*cosd(v+w) + cosd(OM)*sind(v+w)*cosd(inc)),
                  r*sind(v+w)*sind(inc) ];

    // heliocentric ecliptic coordinates of the comet
    //cometPosH_s = vect2sph(cometPosH[0], cometPosH[1], cometPosH[2]);
    cometPosH_s = vect2sph(cometPosH);
    B = cometPosH_s[0];
    L = cometPosH_s[1];

    // geocentric ecliptic coordinates of the Sun
    sunPos_g = sunCoord(Tobs);
    Rs = sunPos_g[0];
    Ls = sunPos_g[1];

    // Finally, geocentric ecliptic rectangular coordinates of the comet
    x = cometPosH[0] + Rs*cosd(Ls);
    y = cometPosH[1] + Rs*sind(Ls);
    z = cometPosH[2];

    // distance from the Earth
    delta = Math.sqrt(x*x + y*y + z*z);

    // geocentric ecliptic coordinates
    lambda = atan2d(y,x);
    if (lambda < 0){ lambda = lambda+360; }
    beta = atand(z/Math.sqrt(x*x+y*y));

    // Geocentric rectangular equatorial coordinates of the comet
    xeq = x;
    yeq = y*cosd(epsilon) - z*sind(epsilon);
    zeq = y*sind(epsilon) + z*cosd(epsilon);
    cometPosEq = [xeq, yeq, zeq];

    // geocentric equatorial coordinates of the comet
    RA_ = atan2d(yeq,xeq);

    // correction
    if(RA_<0){ RA_+=360; }

    // RA in [hh, mm, ss]
    RAH = RA_/15;
    RA = [0, 0, 0, 0, 0];
    RA[0] = fix( RAH );
    RA[1] = fix( (RAH-RA[0])*60 );
    RA[2] = fix( (RAH-RA[0]-RA[1]/60)*3600 );

    // DECL in [°, ', "]
    DEC_ = asind(zeq/delta);
    DEC = [0, 0, 0, 0];
    DEC[0] = fix( DEC_ );
    DEC[1] = fix( (DEC_-DEC[0])*60 );
    DEC[2] = fix( (DEC_-DEC[0]-DEC[1]/60)*3600 );
    
    if(DEC[1]<0) { DEC[1]*=-1; }
    if(DEC[2]<0) { DEC[2]*=-1; }

    // RA, DECL single values
    RA[3] = RAH; //hours
    RA[4] = RA_; //degrees
    DEC[3] = DEC_; //degrees

    /* direction from Earth (in the geocentric system)
     rmq: dans le referentiel geocentrique equatorial
            sunPosEq = vecteur Terre->Soleil
          cometPosEq = vecteur Terre->Comete
                RcEq = vecteur Soleil-Comete */
    sunPosEq = [Rs * cosd(Ls),
                Rs * sind(Ls) * cosd(epsilon),
                Rs * sind(Ls) * sind(epsilon)];

    RcEq = vectSubtract(cometPosEq, sunPosEq);

    /* Projections
      for PsAng and PsAMV we need to calculate the coordinates of the projections
      of the needed vectors in the coordinates of the photographic plane

      sunDir is the direction of the Sun measured CCW from north celestial pole
      it's similar to the PsAng from JPL
      (sun-comet extended radius vector measured CCW from north celestial pole)
      problem: we have to determine the angle between two vectors in 3D... so
      we must define what is the positive direction. This is done by
      multiplying anglev() by the sign of  cometPos.(-Rc x [0 0 1]) */

    PASun = geo2PA(cometPosEq, vectMult(RcEq,-1));
    PsAng = (180+PASun) % 360;

    /* velocity (in AU/day)
     velDir is the direction of the velocity vector measured CCW from north celestial pole
     it's similar to the PsAMV from JPL
     (negative of the target's helio velocity vector measured CCW from north celestial pole) */

    cometPosH1 = posHelio(e, q, inc, OM, w, Tp, Tobs-1);
    cometPosH2 = posHelio(e, q, inc, OM, w, Tp, Tobs+1);

    // IMPORTANT: Heliocentric position is calculated at Tobs-1 anf Tobs+1,
    // but Geocentric position MUST be expressed in the frame at Tobs
    cometPosEq1 = helio2geo(cometPosH1, Tobs);
    cometPosEq2 = helio2geo(cometPosH2, Tobs);

    cometVelEq = vectMult(vectSubtract(cometPosEq2, cometPosEq1), 0.5);
    PAVel = geo2PA(cometPosEq, cometVelEq);
    PsAMV = (180+PAVel) % 360;

    /* Save the results */
    var ephem = [Tobs, r, delta, RA, DEC, PsAng, PsAMV];
    return ephem;
}

