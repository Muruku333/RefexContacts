import{r as n,n as C,o as f,s as p,k as m,v as x,_ as v,p as c,j as y,x as R,z as S}from"./index-00aebc20.js";function N({controlled:e,default:t,name:r,state:o="value"}){const{current:s}=n.useRef(e!==void 0),[a,l]=n.useState(t),u=s?e:a,i=n.useCallback(d=>{s||l(d)},[]);return[u,i]}function P({props:e,states:t,muiFormControl:r}){return t.reduce((o,s)=>(o[s]=e[s],r&&typeof e[s]>"u"&&(o[s]=r[s]),o),{})}const U=n.createContext(void 0),h=U;function b(){return n.useContext(h)}function j(e){return C("MuiCard",e)}f("MuiCard",["root"]);const w=["className","raised"],M=e=>{const{classes:t}=e;return S({root:["root"]},j,t)},_=p(m,{name:"MuiCard",slot:"Root",overridesResolver:(e,t)=>t.root})(()=>({overflow:"hidden"})),g=n.forwardRef(function(t,r){const o=x({props:t,name:"MuiCard"}),{className:s,raised:a=!1}=o,l=v(o,w),u=c({},o,{raised:a}),i=M(u);return y.jsx(_,c({className:R(i.root,s),elevation:a?8:void 0,ref:r,ownerState:u},l))}),k=g;export{k as C,h as F,b as a,P as f,N as u};
