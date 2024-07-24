function renderInfo(data, isHalf = false) {
    let result = '<div class="tBox">';

    let arr = [];
    let getUnique = (e, arrc, repeat = 0) => {
        if (repeat) e = `${e}-${repeat}`;
        if (arrc.indexOf(e) >= 0) {
            return getUnique(e, arrc, repeat + 1);
        } else {
            return e;
        }
    };

    let allInput = "margin: 0 11px 0 10px;";
    let unName;
    let maxFontNum = 0;
    data.forEach(v => {
        maxFontNum = v.prefix ? (
            v.prefix.length > maxFontNum ? v.prefix.length : maxFontNum
        ) : maxFontNum;
        switch (v.type) {
            case "radio":
                unName = getUnique(v.name, arr);
                arr.push(unName);
                result += `<div class="para">
                    <div cc>${v.prefix ? v.prefix : ""}</div><div class="${v.align ? v.align : "col"}">`;
                v.choose.forEach((j, i) => {
                    result += `<div><label>
                    <input type=radio ${v.required ? "required" : ""} name=${unName} value="${i}" style="${allInput}" />
                    ${j}
                    </label></div>`
                });
                result += "</div></div>";
                break;
            case "number":
                unName = getUnique(v.name, arr);
                arr.push(unName);
                result += `
                <div class="para">
                    <div cc>${v.prefix ? v.prefix : ""}</div>
                    <input size=${v.size} type=number ${v.required ? "required" : ""} name=${unName} style="${allInput}" />${v.suffix ? v.suffix : ""}
                </div>
                `;
                break;
            case "text":
                unName = getUnique(v.name, arr);
                arr.push(unName);
                result += `
                <div class="para">
                    <div cc>${v.prefix ? v.prefix : ""}</div>
                    <input size=${v.size} type=text ${v.required ? "required" : ""} name=${unName} style="${allInput}" />${v.suffix ? v.suffix : ""}
                </div>
                    `;
                break;
        }
    });
    result += '</div>';
    let style = `
<style>
.tBox {
    text-align: left;
    font-size: 20px;
    height: 500px;
    overflow-x: auto;
}
p {
    margin: 0 0 0 166px;
    padding: 0;
}
[type="text"]{
    font-size: 20px;
    line-height: 1.8em;
}
.para {
    margin: 20px 0 0 0;
    border-block-end: 1px solid white;
}
.para>div {
    vertical-align: top;
}
div[cc] {
    display: inline-block;
    width: ${maxFontNum * (isHalf ? 11 : 22) + 20}px;
}
.col{
    display: inline-block;
}
.col>div{
    display: block;
}
.hor {
    display: inline-block;
}
.hor>div{
    display: inline-block;
}
</style>`;
    return `${style} ${result}`
}

export default renderInfo;