import{C as R,Z as T,V as w,ad as H}from"./main.js";class W{parse(G){let r="",l=0,g=0,B=0;const n=new w,b=new R,E=new w,v=new H,d=[];function M(e){let x=0,s=0,u=0;const f=e.geometry,t=new T;if(f.isBufferGeometry!==!0)throw new Error("THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.");const i=f.getAttribute("position"),a=f.getAttribute("normal"),y=f.getAttribute("uv"),A=f.getIndex();if(r+="o "+e.name+`
`,e.material&&e.material.name&&(r+="usemtl "+e.material.name+`
`),i!==void 0)for(let o=0,m=i.count;o<m;o++,x++)n.fromBufferAttribute(i,o),n.applyMatrix4(e.matrixWorld),r+="v "+n.x+" "+n.y+" "+n.z+`
`;if(y!==void 0)for(let o=0,m=y.count;o<m;o++,u++)v.fromBufferAttribute(y,o),r+="vt "+v.x+" "+v.y+`
`;if(a!==void 0){t.getNormalMatrix(e.matrixWorld);for(let o=0,m=a.count;o<m;o++,s++)E.fromBufferAttribute(a,o),E.applyMatrix3(t).normalize(),r+="vn "+E.x+" "+E.y+" "+E.z+`
`}if(A!==null)for(let o=0,m=A.count;o<m;o+=3){for(let c=0;c<3;c++){const p=A.getX(o+c)+1;d[c]=l+p+(a||y?"/"+(y?g+p:"")+(a?"/"+(B+p):""):"")}r+="f "+d.join(" ")+`
`}else for(let o=0,m=i.count;o<m;o+=3){for(let c=0;c<3;c++){const p=o+c+1;d[c]=l+p+(a||y?"/"+(y?g+p:"")+(a?"/"+(B+p):""):"")}r+="f "+d.join(" ")+`
`}l+=x,g+=u,B+=s}function V(e){let x=0;const s=e.geometry,u=e.type;if(s.isBufferGeometry!==!0)throw new Error("THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.");const f=s.getAttribute("position");if(r+="o "+e.name+`
`,f!==void 0)for(let t=0,i=f.count;t<i;t++,x++)n.fromBufferAttribute(f,t),n.applyMatrix4(e.matrixWorld),r+="v "+n.x+" "+n.y+" "+n.z+`
`;if(u==="Line"){r+="l ";for(let t=1,i=f.count;t<=i;t++)r+=l+t+" ";r+=`
`}if(u==="LineSegments")for(let t=1,i=t+1,a=f.count;t<a;t+=2,i=t+1)r+="l "+(l+t)+" "+(l+i)+`
`;l+=x}function j(e){let x=0;const s=e.geometry;if(s.isBufferGeometry!==!0)throw new Error("THREE.OBJExporter: Geometry is not of type THREE.BufferGeometry.");const u=s.getAttribute("position"),f=s.getAttribute("color");if(r+="o "+e.name+`
`,u!==void 0){for(let t=0,i=u.count;t<i;t++,x++)n.fromBufferAttribute(u,t),n.applyMatrix4(e.matrixWorld),r+="v "+n.x+" "+n.y+" "+n.z,f!==void 0&&(b.fromBufferAttribute(f,t).convertLinearToSRGB(),r+=" "+b.r+" "+b.g+" "+b.b),r+=`
`;r+="p ";for(let t=1,i=u.count;t<=i;t++)r+=l+t+" ";r+=`
`}l+=x}return G.traverse(function(e){e.isMesh===!0&&M(e),e.isLine===!0&&V(e),e.isPoints===!0&&j(e)}),r}}export{W as OBJExporter};
