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
// Divergence from docs/handoff/muush-1.0/shaders/m1-liston.glsl (Roberto, 2026-11-01):
// the grain hash is seeded with gl_FragCoord only, not fract(u_time*7.0), so the
// grain is a fixed texture instead of flickering every frame ("como ISO alto").
// u_grain still sets its strength. This is the only change from the handoff.
vec3 finish(vec3 col,vec2 uv){vec2 dm=(uv-vec2(u_tx,u_ty))/vec2(u_trx,u_try);float tm=smoothstep(0.55,1.3,length(dm));col*=mix(1.0-u_tdark*0.78,1.0,tm);float fe=smoothstep(0.0,max(u_fadeT,0.0001),uv.y)*(1.0-smoothstep(1.0-max(u_fadeB,0.0001),1.0,uv.y));if(u_fadeT<=0.0001&&u_fadeB<=0.0001){fe=1.0;}col=mix(cBlack,col,fe);col+=(hash(gl_FragCoord.xy)-0.5)*u_grain;return clamp(col,0.0,1.0);}
/**
 * @label Inicio izq (alto)
 * @default 0.98
 * @range -0.2, 1.3
 */
uniform float u_y0;
/**
 * @label Final der (alto)
 * @default 0.5
 * @range -0.2, 1.3
 */
uniform float u_y1;
/**
 * @label Ondulación
 * @default 0.07
 * @range 0, 0.3
 */
uniform float u_amp;
/**
 * @label Grosor
 * @default 0.1
 * @range 0.02, 0.4
 */
uniform float u_th;
/**
 * @label Giros brasa/acero
 * @default 0.6
 * @range 0, 3
 */
uniform float u_twist;
void main(){
  vec2 uv=uvTop();
  float t=u_time*0.15*u_speed;
  float x=uv.x;
  vec3 col=cBlack;
  for(int k=0;k<3;k++){
    float fk=float(k);
    float off=fk*0.11;
    float yc=u_y0+off*0.6+(u_y1+off-u_y0-off*0.6)*x+u_amp*sin(x*3.8+t*2.0+fk*0.9)+0.025*sin(x*11.0-t*3.0+fk);
    float th=u_th*(1.0+fk*0.7)*(0.75+0.35*sin(x*4.0+t*1.3+fk*1.7));
    float d=(uv.y-yc)/th;
    float body=exp(-d*d*1.6);
    float glow=exp(-d*d*0.10)*0.30;
    float amt=1.0/(1.0+fk*1.6);
    float cw=smoothstep(-0.35,0.35,sin(x*u_twist*6.2832+t*1.7+0.8+fk*1.9));
    vec3 warm=mix(cCrimson,cRed,smoothstep(0.35,1.0,body));
    vec3 cold=mix(cS8,cS4,smoothstep(0.35,1.0,body));
    vec3 rib=mix(cold,warm,cw);
    float hl=exp(-pow(d+0.6,2.0)*12.0);
    col+=mix(cS8,cOx,cw)*glow*amt;
    col=mix(col,rib,body*0.95*amt);
    col+=mix(cS2,cCoral,cw)*hl*0.30*amt;
  }
  gl_FragColor=vec4(finish(col,uv),1.0);
}
