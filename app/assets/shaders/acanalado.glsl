precision highp float;
/** @resolution */
uniform vec2 u_res;
/** @time */
uniform float u_time;
/**
 * @label Velocidad
 * @default 1
 * @range 0, 3
 */
uniform float u_speed;
/**
 * @label Invertir eje Y
 * @default 1
 * @range 0, 1
 */
uniform float u_flip;
/**
 * @label Grano
 * @default 0.07
 * @range 0, 0.2
 */
uniform float u_grain;
/**
 * @label Zona de texto X
 * @default 0.5
 * @range 0, 1
 */
uniform float u_tx;
/**
 * @label Zona de texto Y
 * @default 0.48
 * @range 0, 1
 */
uniform float u_ty;
/**
 * @label Zona de texto ancho
 * @default 0.36
 * @range 0.05, 1
 */
uniform float u_trx;
/**
 * @label Zona de texto alto
 * @default 0.3
 * @range 0.05, 1
 */
uniform float u_try;
/**
 * @label Oscurecer zona de texto
 * @default 1
 * @range 0, 1
 */
uniform float u_tdark;
/**
 * @label Fundido arriba
 * @default 0
 * @range 0, 0.6
 */
uniform float u_fadeT;
/**
 * @label Fundido abajo
 * @default 0
 * @range 0, 0.6
 */
uniform float u_fadeB;
const vec3 cBlack=vec3(0.0196,0.0196,0.0196);
const vec3 cRed=vec3(0.898,0.208,0.184);
const vec3 cCrimson=vec3(0.557,0.165,0.118);
const vec3 cOx=vec3(0.290,0.090,0.082);
const vec3 cCoral=vec3(0.788,0.376,0.290);
const vec3 cArena=vec3(0.702,0.545,0.482);
const vec3 cS2=vec3(0.651,0.714,0.698);
const vec3 cS4=vec3(0.290,0.404,0.420);
const vec3 cS8=vec3(0.122,0.196,0.212);
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);vec2 u=f*f*(3.0-2.0*f);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float v=0.0;float a=0.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=0.5;}return v;}
vec2 uvTop(){vec2 fc=gl_FragCoord.xy;if(u_flip>0.5){fc.y=u_res.y-fc.y;}return fc/u_res;}
// Divergence from docs/handoff/muush-1.0/shaders/m1-acanalado.glsl (Roberto, 2026-11-01):
// the grain hash is seeded with gl_FragCoord only, not fract(u_time*7.0), so the
// grain is a fixed texture instead of flickering every frame ("como ISO alto").
// u_grain still sets its strength. This is the only change from the handoff.
vec3 finish(vec3 col,vec2 uv){vec2 dm=(uv-vec2(u_tx,u_ty))/vec2(u_trx,u_try);float tm=smoothstep(0.55,1.3,length(dm));col*=mix(1.0-u_tdark*0.78,1.0,tm);float fe=smoothstep(0.0,max(u_fadeT,0.0001),uv.y)*(1.0-smoothstep(1.0-max(u_fadeB,0.0001),1.0,uv.y));if(u_fadeT<=0.0001&&u_fadeB<=0.0001){fe=1.0;}col=mix(cBlack,col,fe);col+=(hash(gl_FragCoord.xy)-0.5)*u_grain;return clamp(col,0.0,1.0);}
/**
 * @label Costillas
 * @default 46
 * @range 6, 140
 */
uniform float u_ribs;
/**
 * @label Refracción
 * @default 0.05
 * @range 0, 0.2
 */
uniform float u_refract;
/**
 * @label Inicio izq (alto)
 * @default 0.62
 * @range -0.2, 1.3
 */
uniform float u_y0;
/**
 * @label Final der (alto)
 * @default 0.45
 * @range -0.2, 1.3
 */
uniform float u_y1;
/**
 * @label Grosor
 * @default 0.22
 * @range 0.05, 0.8
 */
uniform float u_th;
/**
 * @label Intensidad a la derecha
 * @default 0.55
 * @range 0, 1
 */
uniform float u_right;
void main(){
  vec2 uv=uvTop();
  float a=u_res.x/u_res.y;
  float t=u_time*0.08*u_speed;
  float rx=fract(uv.x*u_ribs);
  vec2 s=vec2(uv.x+(rx-0.5)*u_refract,uv.y);
  float n=fbm(vec2(s.x*a,s.y)*1.4+vec2(t,-t*0.6));
  float w=s.y-(u_y0+(u_y1-u_y0)*s.x+0.1*sin(s.x*5.0+t*2.0)+(n-0.5)*0.35);
  float band=exp(-w*w/(u_th*u_th));
  float cold=smoothstep(0.3,0.75,s.x+(n-0.5)*0.6+0.12*sin(t*1.5));
  vec3 warm=mix(cCrimson,cRed,smoothstep(0.45,1.0,band));
  vec3 cl=mix(cS8,cS4,smoothstep(0.45,1.0,band));
  vec3 mc=mix(warm,cl,cold);
  vec3 col=mix(cBlack,mc,smoothstep(0.02,0.85,band)*mix(1.0,u_right,uv.x));
  col*=0.8+0.2*sin(rx*3.14159);
  col*=0.82+0.18*smoothstep(0.0,0.05,rx)*(1.0-smoothstep(0.95,1.0,rx));
  col+=vec3(0.957,0.957,0.949)*0.06*exp(-pow(rx-0.2,2.0)*260.0)*band;
  gl_FragColor=vec4(finish(col,uv),1.0);
}
