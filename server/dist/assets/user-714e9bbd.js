import{j as e,P as X,T,f as i,r as g,S as R,A as _,I as k,g as $,M as I,B as Y,h as G,W as J}from"./index-6dfa1faa.js";import{l as U}from"./lodash-0e06be45.js";import{f as S}from"./index-cb482739.js";import{I as f}from"./iconify-6577033b.js";import{C as N,S as K}from"./scrollbar-8daf3b44.js";import{T as C,a as p,b as Q,c as Z}from"./TableSortLabel-460af97a.js";import{L as ee}from"./label-3415dac2.js";import{O as ne}from"./Select-3bfe8117.js";import{I as re}from"./InputAdornment-0cda3bbf.js";import{T as F}from"./Tooltip-0074db8b.js";import{C as te}from"./Container-f1e0aae0.js";import{B as se}from"./Button-e3bcca55.js";import{C as ie}from"./Card-03ab618e.js";import{T as ae,a as oe,b as le}from"./TableContainer-52c5eb15.js";import{T as ce}from"./TablePagination-2766dbf0.js";import"./Menu-8b2c7413.js";import"./Popper-c092d979.js";const y=[...Array(24)].map((n,r)=>({id:S.string.uuid(),avatarUrl:`/assets/images/avatars/avatar_${r+1}.jpg`,name:S.person.fullName(),company:S.company.name(),isVerified:S.datatype.boolean(),status:U.sample(["active","banned"]),role:U.sample(["Leader","Hr Manager","UI Designer","UX Designer","UI/UX Designer","Project Manager","Backend Developer","Full Stack Designer","Front End Developer","Full Stack Developer"])}));function A({query:n}){return e.jsx(C,{children:e.jsx(p,{align:"center",colSpan:6,sx:{py:3},children:e.jsxs(X,{sx:{textAlign:"center"},children:[e.jsx(T,{variant:"h6",paragraph:!0,children:"Not found"}),e.jsxs(T,{variant:"body2",children:["No results found for  ",e.jsxs("strong",{children:['"',n,'"']}),".",e.jsx("br",{})," Try checking for typos or using complete words."]})]})})})}A.propTypes={query:i.string};function D({selected:n,name:r,avatarUrl:t,company:l,role:s,isVerified:c,status:h,handleClick:b}){const[a,j]=g.useState(null),u=P=>{j(P.currentTarget)},v=()=>{j(null)};return e.jsxs(e.Fragment,{children:[e.jsxs(C,{hover:!0,tabIndex:-1,role:"checkbox",selected:n,children:[e.jsx(p,{padding:"checkbox",children:e.jsx(N,{disableRipple:!0,checked:n,onChange:b})}),e.jsx(p,{component:"th",scope:"row",padding:"none",children:e.jsxs(R,{direction:"row",alignItems:"center",spacing:2,children:[e.jsx(_,{alt:r,src:t}),e.jsx(T,{variant:"subtitle2",noWrap:!0,children:r})]})}),e.jsx(p,{children:l}),e.jsx(p,{children:s}),e.jsx(p,{align:"center",children:c?"Yes":"No"}),e.jsx(p,{children:e.jsx(ee,{color:h==="banned"&&"error"||"success",children:h})}),e.jsx(p,{align:"right",children:e.jsx(k,{onClick:u,children:e.jsx(f,{icon:"eva:more-vertical-fill"})})})]}),e.jsxs($,{open:!!a,anchorEl:a,onClose:v,anchorOrigin:{vertical:"top",horizontal:"left"},transformOrigin:{vertical:"top",horizontal:"right"},PaperProps:{sx:{width:140}},children:[e.jsxs(I,{onClick:v,children:[e.jsx(f,{icon:"eva:edit-fill",sx:{mr:2}}),"Edit"]}),e.jsxs(I,{onClick:v,sx:{color:"error.main"},children:[e.jsx(f,{icon:"eva:trash-2-outline",sx:{mr:2}}),"Delete"]})]})]})}D.propTypes={avatarUrl:i.any,company:i.any,handleClick:i.func,isVerified:i.any,name:i.any,role:i.any,selected:i.any,status:i.string};const de={border:0,margin:-1,padding:0,width:"1px",height:"1px",overflow:"hidden",position:"absolute",whiteSpace:"nowrap",clip:"rect(0 0 0 0)"};function he(n,r,t){return n?Math.max(0,(1+n)*r-t):0}function O(n,r,t){return n[t]===null?1:r[t]===null||r[t]<n[t]?-1:r[t]>n[t]?1:0}function pe(n,r){return n==="desc"?(t,l)=>O(t,l,r):(t,l)=>-O(t,l,r)}function me({inputData:n,comparator:r,filterName:t}){const l=n.map((s,c)=>[s,c]);return l.sort((s,c)=>{const h=r(s[0],c[0]);return h!==0?h:s[1]-c[1]}),n=l.map(s=>s[0]),t&&(n=n.filter(s=>s.name.toLowerCase().indexOf(t.toLowerCase())!==-1)),n}function L({order:n,orderBy:r,rowCount:t,headLabel:l,numSelected:s,onRequestSort:c,onSelectAllClick:h}){const b=a=>j=>{c(j,a)};return e.jsx(Q,{children:e.jsxs(C,{children:[e.jsx(p,{padding:"checkbox",children:e.jsx(N,{indeterminate:s>0&&s<t,checked:t>0&&s===t,onChange:h})}),l.map(a=>e.jsx(p,{align:a.align||"left",sortDirection:r===a.id?n:!1,sx:{width:a.width,minWidth:a.minWidth},children:e.jsxs(Z,{hideSortIcon:!0,active:r===a.id,direction:r===a.id?n:"asc",onClick:b(a.id),children:[a.label,r===a.id?e.jsx(Y,{sx:{...de},children:n==="desc"?"sorted descending":"sorted ascending"}):null]})},a.id))]})})}L.propTypes={order:i.oneOf(["asc","desc"]),orderBy:i.string,rowCount:i.number,headLabel:i.array,numSelected:i.number,onRequestSort:i.func,onSelectAllClick:i.func};function M({emptyRows:n,height:r}){return n?e.jsx(C,{sx:{...r&&{height:r*n}},children:e.jsx(p,{colSpan:9})}):null}M.propTypes={emptyRows:i.number,height:i.number};function E({numSelected:n,filterName:r,onFilterName:t}){return e.jsxs(G,{sx:{height:96,display:"flex",justifyContent:"space-between",p:l=>l.spacing(0,1,0,3),...n>0&&{color:"primary.main",bgcolor:"primary.lighter"}},children:[n>0?e.jsxs(T,{component:"div",variant:"subtitle1",children:[n," selected"]}):e.jsx(ne,{value:r,onChange:t,placeholder:"Search user...",startAdornment:e.jsx(re,{position:"start",children:e.jsx(f,{icon:"eva:search-fill",sx:{color:"text.disabled",width:20,height:20}})})}),n>0?e.jsx(F,{title:"Delete",children:e.jsx(k,{children:e.jsx(f,{icon:"eva:trash-2-fill"})})}):e.jsx(F,{title:"Filter list",children:e.jsx(k,{children:e.jsx(f,{icon:"ic:round-filter-list"})})})]})}E.propTypes={numSelected:i.number,filterName:i.string,onFilterName:i.func};function xe(){const[n,r]=g.useState(0),[t,l]=g.useState("asc"),[s,c]=g.useState([]),[h,b]=g.useState("name"),[a,j]=g.useState(""),[u,v]=g.useState(5),P=(o,d)=>{d!==""&&(l(h===d&&t==="asc"?"desc":"asc"),b(d))},V=o=>{if(o.target.checked){const d=y.map(m=>m.name);c(d);return}c([])},W=(o,d)=>{const m=s.indexOf(d);let x=[];m===-1?x=x.concat(s,d):m===0?x=x.concat(s.slice(1)):m===s.length-1?x=x.concat(s.slice(0,-1)):m>0&&(x=x.concat(s.slice(0,m),s.slice(m+1))),c(x)},q=(o,d)=>{r(d)},H=o=>{r(0),v(parseInt(o.target.value,10))},z=o=>{r(0),j(o.target.value)},w=me({inputData:y,comparator:pe(t,h),filterName:a}),B=!w.length&&!!a;return e.jsxs(te,{children:[e.jsxs(R,{direction:"row",alignItems:"center",justifyContent:"space-between",mb:5,children:[e.jsx(T,{variant:"h4",children:"Users"}),e.jsx(se,{variant:"contained",color:"inherit",startIcon:e.jsx(f,{icon:"eva:plus-fill"}),children:"New User"})]}),e.jsxs(ie,{children:[e.jsx(E,{numSelected:s.length,filterName:a,onFilterName:z}),e.jsx(K,{children:e.jsx(ae,{sx:{overflow:"unset"},children:e.jsxs(oe,{sx:{minWidth:800},children:[e.jsx(L,{order:t,orderBy:h,rowCount:y.length,numSelected:s.length,onRequestSort:P,onSelectAllClick:V,headLabel:[{id:"name",label:"Name"},{id:"company",label:"Company"},{id:"role",label:"Role"},{id:"isVerified",label:"Verified",align:"center"},{id:"status",label:"Status"},{id:""}]}),e.jsxs(le,{children:[w.slice(n*u,n*u+u).map(o=>e.jsx(D,{name:o.name,role:o.role,status:o.status,company:o.company,avatarUrl:o.avatarUrl,isVerified:o.isVerified,selected:s.indexOf(o.name)!==-1,handleClick:d=>W(d,o.name)},o.id)),e.jsx(M,{height:77,emptyRows:he(n,u,y.length)}),B&&e.jsx(A,{query:a})]})]})})}),e.jsx(ce,{page:n,component:"div",count:y.length,rowsPerPage:u,onPageChange:q,rowsPerPageOptions:[5,10,25],onRowsPerPageChange:H})]})]})}function Re(){return e.jsxs(e.Fragment,{children:[e.jsx(J,{children:e.jsx("title",{children:" User | Minimal UI "})}),e.jsx(xe,{})]})}export{Re as default};
