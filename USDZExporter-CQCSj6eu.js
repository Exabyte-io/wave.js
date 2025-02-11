import{aE as x,aF as y}from"./main.js";class R{async parse(s){const e={},n="model.usda";e[n]=null;let o=_();const i={},p={};s.traverseVisible(r=>{if(r.isMesh)if(r.material.isMeshStandardMaterial){const c=r.geometry,u=r.material,a="geometries/Geometry_"+c.id+".usd";if(!(a in e)){const f=U(c);e[a]=S(f)}u.uuid in i||(i[u.uuid]=u),o+=b(r,c,u)}else console.warn("THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)",r)}),o+=D(i,p),e[n]=x(o),o=null;for(const r in p){const c=p[r],u=r.split("_")[1],a=c.format===1023,f=T(c.image,u),$=await new Promise(v=>f.toBlob(v,a?"image/png":"image/jpeg",1));e[`textures/Texture_${r}.${a?"png":"jpg"}`]=new Uint8Array(await $.arrayBuffer())}let l=0;for(const r in e){const c=e[r],u=34+r.length;l+=u;const a=l&63;if(a!==4){const f=64-a,$=new Uint8Array(f);e[r]=[c,{extra:{12345:$}}]}l=c.length}return y(e,{level:0})}}function T(t,s){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=1024/Math.max(t.width,t.height),n=document.createElement("canvas");n.width=t.width*Math.min(1,e),n.height=t.height*Math.min(1,e);const o=n.getContext("2d");if(o.drawImage(t,0,0,n.width,n.height),s!==void 0){const i=parseInt(s,16),p=(i>>16&255)/255,l=(i>>8&255)/255,r=(i&255)/255,c=o.getImageData(0,0,n.width,n.height),u=c.data;for(let a=0;a<u.length;a+=4)u[a+0]=u[a+0]*p,u[a+1]=u[a+1]*l,u[a+2]=u[a+2]*r;o.putImageData(c,0,0)}return n}}const d=7;function _(){return`#usda 1.0
(
    customLayerData = {
        string creator = "Three.js USDZExporter"
    }
    metersPerUnit = 1
    upAxis = "Y"
)

`}function S(t){let s=_();return s+=t,x(s)}function b(t,s,e){const n="Object_"+t.id,o=w(t.matrixWorld);return t.matrixWorld.determinant()<0&&console.warn("THREE.USDZExporter: USDZ does not support negative scales",t),`def Xform "${n}" (
    prepend references = @./geometries/Geometry_${s.id}.usd@</Geometry>
)
{
    matrix4d xformOp:transform = ${o}
    uniform token[] xformOpOrder = ["xformOp:transform"]

    rel material:binding = </Materials/Material_${e.id}>
}

`}function w(t){const s=t.elements;return`( ${h(s,0)}, ${h(s,4)}, ${h(s,8)}, ${h(s,12)} )`}function h(t,s){return`(${t[s+0]}, ${t[s+1]}, ${t[s+2]}, ${t[s+3]})`}function U(t){return`
def "Geometry"
{
  ${E(t)}
}
`}function E(t){const s="Geometry",e=t.attributes,n=e.position.count;return`
    def Mesh "${s}"
    {
        int[] faceVertexCounts = [${P(t)}]
        int[] faceVertexIndices = [${k(t)}]
        normal3f[] normals = [${M(e.normal,n)}] (
            interpolation = "vertex"
        )
        point3f[] points = [${M(e.position,n)}]
        float2[] primvars:st = [${C(e.uv,n)}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
    }
`}function P(t){const s=t.index!==null?t.index.count:t.attributes.position.count;return Array(s/3).fill(3).join(", ")}function k(t){const s=t.index,e=[];if(s!==null)for(let n=0;n<s.count;n++)e.push(s.getX(n));else{const n=t.attributes.position.count;for(let o=0;o<n;o++)e.push(o)}return e.join(", ")}function M(t,s){if(t===void 0)return console.warn("USDZExporter: Normals missing."),Array(s).fill("(0, 0, 0)").join(", ");const e=[];for(let n=0;n<t.count;n++){const o=t.getX(n),i=t.getY(n),p=t.getZ(n);e.push(`(${o.toPrecision(d)}, ${i.toPrecision(d)}, ${p.toPrecision(d)})`)}return e.join(", ")}function C(t,s){if(t===void 0)return console.warn("USDZExporter: UVs missing."),Array(s).fill("(0, 0)").join(", ");const e=[];for(let n=0;n<t.count;n++){const o=t.getX(n),i=t.getY(n);e.push(`(${o.toPrecision(d)}, ${1-i.toPrecision(d)})`)}return e.join(", ")}function D(t,s){const e=[];for(const n in t){const o=t[n];e.push(I(o,s))}return`def "Materials"
{
${e.join("")}
}

`}function I(t,s){const e="            ",n=[],o=[];function i(p,l,r){const c=p.id+(r?"_"+r.getHexString():""),u=p.format===1023;return s[c]=p,`
        def Shader "Transform2d_${l}" (
            sdrMetadata = {
                string role = "math"
            }
        )
        {
            uniform token info:id = "UsdTransform2d"
            float2 inputs:in.connect = </Materials/Material_${t.id}/uvReader_st.outputs:result>
            float2 inputs:scale = ${m(p.repeat)}
            float2 inputs:translation = ${m(p.offset)}
            float2 outputs:result
        }

        def Shader "Texture_${p.id}_${l}"
        {
            uniform token info:id = "UsdUVTexture"
            asset inputs:file = @textures/Texture_${c}.${u?"png":"jpg"}@
            float2 inputs:st.connect = </Materials/Material_${t.id}/Transform2d_${l}.outputs:result>
            token inputs:wrapS = "repeat"
            token inputs:wrapT = "repeat"
            float outputs:r
            float outputs:g
            float outputs:b
            float3 outputs:rgb
            ${t.transparent||t.alphaTest>0?"float outputs:a":""}
        }`}return t.map!==null?(n.push(`${e}color3f inputs:diffuseColor.connect = </Materials/Material_${t.id}/Texture_${t.map.id}_diffuse.outputs:rgb>`),t.transparent?n.push(`${e}float inputs:opacity.connect = </Materials/Material_${t.id}/Texture_${t.map.id}_diffuse.outputs:a>`):t.alphaTest>0&&(n.push(`${e}float inputs:opacity.connect = </Materials/Material_${t.id}/Texture_${t.map.id}_diffuse.outputs:a>`),n.push(`${e}float inputs:opacityThreshold = ${t.alphaTest}`)),o.push(i(t.map,"diffuse",t.color))):n.push(`${e}color3f inputs:diffuseColor = ${g(t.color)}`),t.emissiveMap!==null?(n.push(`${e}color3f inputs:emissiveColor.connect = </Materials/Material_${t.id}/Texture_${t.emissiveMap.id}_emissive.outputs:rgb>`),o.push(i(t.emissiveMap,"emissive"))):t.emissive.getHex()>0&&n.push(`${e}color3f inputs:emissiveColor = ${g(t.emissive)}`),t.normalMap!==null&&(n.push(`${e}normal3f inputs:normal.connect = </Materials/Material_${t.id}/Texture_${t.normalMap.id}_normal.outputs:rgb>`),o.push(i(t.normalMap,"normal"))),t.aoMap!==null&&(n.push(`${e}float inputs:occlusion.connect = </Materials/Material_${t.id}/Texture_${t.aoMap.id}_occlusion.outputs:r>`),o.push(i(t.aoMap,"occlusion"))),t.roughnessMap!==null&&t.roughness===1?(n.push(`${e}float inputs:roughness.connect = </Materials/Material_${t.id}/Texture_${t.roughnessMap.id}_roughness.outputs:g>`),o.push(i(t.roughnessMap,"roughness"))):n.push(`${e}float inputs:roughness = ${t.roughness}`),t.metalnessMap!==null&&t.metalness===1?(n.push(`${e}float inputs:metallic.connect = </Materials/Material_${t.id}/Texture_${t.metalnessMap.id}_metallic.outputs:b>`),o.push(i(t.metalnessMap,"metallic"))):n.push(`${e}float inputs:metallic = ${t.metalness}`),t.alphaMap!==null?(n.push(`${e}float inputs:opacity.connect = </Materials/Material_${t.id}/Texture_${t.alphaMap.id}_opacity.outputs:r>`),n.push(`${e}float inputs:opacityThreshold = 0.0001`),o.push(i(t.alphaMap,"opacity"))):n.push(`${e}float inputs:opacity = ${t.opacity}`),t.isMeshPhysicalMaterial&&(n.push(`${e}float inputs:clearcoat = ${t.clearcoat}`),n.push(`${e}float inputs:clearcoatRoughness = ${t.clearcoatRoughness}`),n.push(`${e}float inputs:ior = ${t.ior}`)),`
    def Material "Material_${t.id}"
    {
        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
${n.join(`
`)}
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }

        token outputs:surface.connect = </Materials/Material_${t.id}/PreviewSurface.outputs:surface>
        token inputs:frame:stPrimvarName = "st"

        def Shader "uvReader_st"
        {
            uniform token info:id = "UsdPrimvarReader_float2"
            token inputs:varname.connect = </Materials/Material_${t.id}.inputs:frame:stPrimvarName>
            float2 inputs:fallback = (0.0, 0.0)
            float2 outputs:result
        }

${o.join(`
`)}

    }
`}function g(t){return`(${t.r}, ${t.g}, ${t.b})`}function m(t){return`(${t.x}, ${t.y})`}export{R as USDZExporter};
