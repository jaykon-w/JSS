
var JSS = function(obj){
	this.obj = obj;
	this.stl;
	this.CSS_Debug = {};
	this.Core();
};

JSS.currentSelector;
JSS.Images = [];

JSS.prototype.Core = function(){
	var me = this;
	var interator = 0;
	
	function waitImageLoad(){
		if(JSS.Images.length > 0 && JSS.Images.length > interator){
			if(JSS.Images[interator].loaded){
				interator++;
			}
			setTimeout(waitImageLoad, 300);
		}else{
			render();
		}
	}
	
	
	function render(){
		var i = me.obj.init;
		me.stl = JSS.$('#JSS_CORE');
		
		if(me.stl.length == 0){
			document.head.innerHTML += "<style id=\"JSS_CORE\"></style>";
			me.stl = JSS.$('#JSS_CORE');
		};
		
		//this.stl = this.stl[0].sheet
		me.stl = me.stl[0]
		
		for(key in i){
			me.Each(i[key], key);
		}
	}
	waitImageLoad();
};

JSS.$ = function(selector){
	if(selector == "&"){
		selector = JSS.currentSelector;
	}
	return document.querySelectorAll(selector);
};

JSS.prototype.Each = function(obj, selector, prop_master){
	var me = this;
	prop_master = (prop_master == null ? "" : prop_master);
	
	Object.keys(obj).forEach(function(prop){
		
		var prop_master_fim = (prop_master != "" ? prop_master+"-" : prop_master);
		
		if(obj[prop] instanceof JSS.Color){
			obj[prop] = obj[prop].toString();
		}
		
		
		if(typeof obj[prop] === "object"){
			if(prop[0]=="&"){
				if(/^&\((.*)\)/g.test(prop)){
					var child = parseInt( /^&\((.*)\)/g.exec(prop)[1] );
					
					if(child < 0) me.Each(obj[prop], selector+":nth-last-child("+Math.abs(child)+")", null);
					else me.Each(obj[prop], selector+":nth-child("+Math.abs(child)+")", null);
				}
				else{ 
					me.Each(obj[prop], prop.replace(/&/g, selector), null);
				}
			}else if(prop=="$import"){
				me.Each(obj[prop], selector, null);
			}else{
				me.Each(obj[prop], selector, (isNaN(prop) ? prop_master_fim+prop : null));
			}
		}else{		
			JSS.currentSelector = selector;
			//console.log(prop, prop_master_fim);
			if(obj.forEach){
				try{
					
					obj.forEach(function(obj_int){
						//console.log(obj_int);
						
						switch(obj_int){
							case "center":
								fn = me.Center(selector);
								break;
							default:
								me.buildRule(selector, prop_master_fim+prop, obj[prop]);
								/*
								if(me.checkEspecialProperties(selector, prop_master_fim, JSS.Measures(obj[prop])) == false){
									console.log(selector+": { "+prop_master_fim+":"+JSS.Measures(obj[prop])+"; } ");
									me.addRule(selector, prop_master_fim, JSS.Measures(obj[prop]));
								}*/
								break;
						}
					});
				}catch(e){}
			}else{
				me.buildRule(selector, prop_master_fim+prop, obj[prop]);
				/*
				if(me.checkEspecialProperties(selector, prop_master_fim+prop, JSS.Measures(obj[prop])) == false){
					//console.log(selector+": { "+prop_master_fim+prop+":"+JSS.Measures(obj[prop])+"; } ");
					me.addRule(selector, prop_master_fim+prop, JSS.Measures(obj[prop]));
					
				}*/
			}
		}
	});
};


JSS.prototype.buildRule = function(selector, property, value){
	
	var me = this;
	
	if(me.checkEspecialProperties(selector, property, JSS.Measures(value)) == false){
		//console.log(selector+": { "+prop_master_fim+prop+":"+JSS.Measures(obj[prop])+"; } ");
		me.addRule(selector, property, JSS.Measures(value));
		
	}
}


JSS.prototype.addRule = function(selector, property, value){
	if(/#-/.test(selector) == true || /#-/.test(property) == true || /#-/.test(value) == true){
		this.addCrossRule(selector, property, value);
	}else{
		if(property.substring(property.length - 2) == "-&"){
			property = property.substring(0, property.length - 2);
		}
		if(/\@.*?keyframes/.test(selector)){
			this.stl.appendChild(document.createTextNode(selector+" { "+property+" { "+value+"} }"));
			//this.stl.innerText += selector+" { "+property+" { "+value+"} }";
			/*
			try{
				this.stl.insertRule(selector+" { "+property+" { "+value+"} }", 0);
			}catch(e){
				console.warn("propert: "+selector+" { "+property+" { "+value+"} }"+". No match.");
			}
			*/
		}else{
			this.stl.appendChild(document.createTextNode(selector+" { "+property+":"+value+";}"));
			//this.stl.innerText += selector+" { "+property+":"+value+";}";
			/*
			try{
				this.stl.addRule(selector, property+":"+value+";");
			}catch(e){
				this.stl.insertRule(selector+" { "+property+":"+value+";}", 0);
			}
			*/
		}
		this.addToDebug(selector, property, value);
	}
}

JSS.prototype.addCrossRule = function(selector, property, value){
	var me = this;
	
	me.addRule(selector.replace(/\#\-/g, "-webkit-"), property.replace(/\#\-/g, "-webkit-"), value.replace(/\#\-/g, "-webkit-"));
	me.addRule(selector.replace(/\#\-/g, "-moz-"), property.replace(/\#\-/g, "-moz-"), value.replace(/\#\-/g, "-moz-"));
	me.addRule(selector.replace(/\#\-/g, "-o-"), property.replace(/\#\-/g, "-o-"), value.replace(/\#\-/g, "-o-"));
	me.addRule(selector.replace(/\#\-/g, "-ms-"), property.replace(/\#\-/g, "-ms-"), value.replace(/\#\-/g, "-ms-"));
	me.addRule(selector.replace(/\#\-/g, "-khtml-"), property.replace(/\#\-/g, "-khtml-"), value.replace(/\#\-/g, "-khtml-"));
	me.addRule(selector.replace(/\#\-/g, ""), property.replace(/\#\-/g, ""), value.replace(/\#\-/g, ""));
};

JSS.prototype.checkEspecialProperties = function(selector, property, value){
	var tempSelector = [];
	var me = this;
	
	function makeSelector(el){
		var parentNode = el.parentNode.nodeName.toLowerCase();
		tempSelector.push(parentNode);
		
		if(parentNode == "body") tempSelector = tempSelector.reverse();
		else makeSelector(el.parentNode);

		return tempSelector.join(' > ');
	}
		
	if(/JSS/g.test(value) == true){
		eval("value = "+value);
	}else{
		switch(property){
			case 'flex':
				var newSel = makeSelector(JSS.$(selector)[0]);
				me.addRule(newSel, 'display', '#-box');
				me.addRule(selector, '#-box-flex', value);
				
				return true;
				break; 
			
			default:
				return false;
				break;
		}
		
	}
}

JSS.prototype.addToDebug = function(selector, prop, val){
	try{
		this.CSS_Debug[selector][prop] = val;
	}catch(e){
		this.CSS_Debug[selector] = {};
		this.CSS_Debug[selector][prop] = val;
	};
}

JSS.prototype.toCSS = function(toText){
	if(toText == true){
		var json = JSON.stringify(this.CSS_Debug);
		
		json = json.replace(/^\{(.*)\}$/g, "$1");
		json = json.replace(/\\t/g, "");
		json = json.replace(/(\},?)/g, "}\n");
		json = json.replace(/\{/g, "{\n\t");
		json = json.replace(/\}/g, ";\n}");
		json = json.replace(/"(.*)":{/g, "$1 {");
		json = json.replace(/\(\\"(.*)\\"\)/g, "(£$1£)");
		json = json.replace(/","/g, "\";\"");
		json = json.replace(/"/g, "");
		json = json.replace(/\(£(.*)£\)/g, "(\"$1\")");
		json = json.replace(/;/g, ";\n\t");
		
		
	}else{
		var json = this.CSS_Debug;
	}
	return json;
}

JSS.prototype.Center = function(selector){
	
	this.addRule(selector, 'margin-left', '50%');
	this.addRule(selector, 'position', 'relative');
	this.addRule(selector, 'left', JSS.Measures(parseInt(Math.round(~JSS.$(selector)[0].offsetWidth/2))));
	
}

JSS.Measures = function(int){
	
	if(JSS.isFloat(parseFloat(int))) return int;
	else if(JSS.isInt(int)) return int+"px";
	else return int;
}

JSS.isFloat = function(n) {
  	return n===+n && n!==(n|0);
}

JSS.isInt = function(n) {
	return n===+n && n===(n|0);
}


JSS.prototype.toHsla = function(color){
	
	var rgba = (color.r != undefined ? color : JSS.prototype.ColorConvert(color));
	
	rgba.r /= 255; 
	rgba.g /= 255; 
	rgba.b /= 255;
    
	var max = Math.max(rgba.r, rgba.g, rgba.b); 
	var min = Math.min(rgba.r, rgba.g, rgba.b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; 
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case rgba.r: 
				h = (rgba.g - rgba.b) / d + (rgba.g < rgba.b ? 6 : 0); 
				break;
            case rgba.g: 
				h = (rgba.b - rgba.r) / d + 2; 
				break;
            case rgba.b: 
				h = (rgba.r - rgba.g) / d + 4; 
				break;
        }
        h /= 6;
    }

    return {h:Math.floor(h * 360),
			s:Math.floor(s * 100), 
			l:Math.floor(l * 100),
			a:rgba.a};
}

JSS.prototype._colors = {
	"snow": "#FFFAFA",
	"ghostwhite": "#F8F8FF",
	"whitesmoke": "#F5F5F5",
	"gainsboro": "#DCDCDC",
	"floralwhite": "#FFFAF0",
	"oldlace": "#FDF5E6",
	"linen": "#FAF0E6",
	"antiquewhite": "#FAEBD7",
	"papayawhip": "#FFEFD5",
	"blanchedalmond": "#FFEBCD",
	"bisque": "#FFE4C4",
	"peachpuff": "#FFDAB9",
	"navajowhite": "#FFDEAD",
	"moccasin": "#FFE4B5",
	"cornsilk": "#FFF8DC",
	"ivory": "#FFFFF0",
	"lemonchiffon": "#FFFACD",
	"seashell": "#FFF5EE",
	"honeydew": "#F0FFF0",
	"mintcream": "#F5FFFA",
	"azure": "#F0FFFF",
	"aliceblue": "#F0F8FF",
	"lavender": "#E6E6FA",
	"lavenderblush": "#FFF0F5",
	"mistyrose": "#FFE4E1",
	"white": "#FFFFFF",
	"black": "#000000",
	"darkslategray": "#2F4F4F",
	"dimgrey": "#696969",
	"slategrey": "#708090",
	"lightslategray": "#778899",
	"grey": "#BEBEBE",
	"lightgray": "#D3D3D3",
	"midnightblue": "#191970",
	"navyblue": "#000080",
	"cornflowerblue": "#6495ED",
	"darkSlateblue": "#483D8B",
	"slateblue": "#6A5ACD",
	"mediumslateblue": "#7B68EE",
	"lightslateblue": "#8470FF",
	"mediumblue": "#0000CD",
	"royalblue": "#4169E1",
	"blue": "#0000FF",
	"dodgerblue": "#1E90FF",
	"deepskyblue": "#00BFFF",
	"skyblue": "#87CEEB",
	"lightskyblue": "#87CEFA",
	"steelblue": "#4682B4",
	"lightsteelblue": "#B0C4DE",
	"lightblue": "#ADD8E6",
	"powderblue": "#B0E0E6",
	"paleturquoise": "#AFEEEE",
	"darkturquoise": "#00CED1",
	"mediumturquoise": "#48D1CC",
	"turquoise": "#40E0D0",
	"cyan": "#00FFFF",
	"lightcyan": "#E0FFFF",
	"cadetblue": "#5F9EA0",
	"mediumaquamarine": "#66CDAA",
	"aquamarine": "#7FFFD4",
	"darkgreen": "#006400",
	"darkolivegreen": "#556B2F",
	"darkseagreen": "#8FBC8F",
	"seagreen": "#2E8B57",
	"mediumsseagreen": "#3CB371",
	"lightseagreen": "#20B2AA",
	"palegreen": "#98FB98",
	"springgreen": "#00FF7F",
	"lawngreen": "#7CFC00",
	"green": "#00FF00",
	"chartreuse": "#7FFF00",
	"medspringgreen": "#00FA9A",
	"greenyellow": "#ADFF2F",
	"limegreen": "#32CD32",
	"yellowgreen": "#9ACD32",
	"forestgreen": "#228B22",
	"olivedrab": "#6B8E23",
	"darkkhaki": "#BDB76B",
	"palegoldenrod": "#EEE8AA",
	"ltgoldenrodyello": "#FAFAD2",
	"lightyellow": "#FFFFE0",
	"yellow": "#FFFF00",
	"gold": "#FFD700",
	"lightgoldenrod": "#EEDD82",
	"goldenrod": "#DAA520",
	"darkgoldenrod": "#B8860B",
	"rosybrown": "#BC8F8F",
	"indianred": "#CD5C5C",
	"saddlebrown": "#8B4513",
	"sienna": "#A0522D",
	"peru": "#CD853F",
	"burlywood": "#DEB887",
	"beige": "#F5F5DC",
	"wheat": "#F5DEB3",
	"sandybrown": "#F4A460",
	"tan": "#D2B48C",
	"chocolate": "#D2691E",
	"firebrick": "#B22222",
	"brown": "#A52A2A",
	"darksalmon": "#E9967A",
	"salmon": "#FA8072",
	"lightsalmon": "#FFA07A",
	"orange": "#FFA500",
	"darkorange": "#FF8C00",
	"coral": "#FF7F50",
	"lightcoral": "#F08080",
	"tomato": "#FF6347",
	"orangered": "#FF4500",
	"red": "#FF0000",
	"hotpink": "#FF69B4",
	"deeppink": "#FF1493",
	"pink": "#FFC0CB",
	"lightpink": "#FFB6C1",
	"palevioletred": "#DB7093",
	"maroon": "#B03060",
	"mediumvioletred": "#C71585",
	"violetred": "#D02090",
	"magenta": "#FF00FF",
	"violet": "#EE82EE",
	"plum": "#DDA0DD",
	"orchid": "#DA70D6",
	"mediumorchid": "#BA55D3",
	"darkorchid": "#9932CC",
	"darkviolet": "#9400D3",
	"blueviolet": "#8A2BE2",
	"purple": "#A020F0",
	"mediumpurple": "#9370DB",
	"thistle": "#D8BFD8",
	"snow1": "#FFFAFA",
	"snow2": "#EEE9E9",
	"snow3": "#CDC9C9",
	"snow4": "#8B8989",
	"seashell1": "#FFF5EE",
	"seashell2": "#EEE5DE",
	"seashell3": "#CDC5BF",
	"seashell4": "#8B8682",
	"antiquewhite1": "#FFEFDB",
	"antiquewhite2": "#EEDFCC",
	"antiquewhite3": "#CDC0B0",
	"antiquewhite4": "#8B8378",
	"bisque1": "#FFE4C4",
	"bisque2": "#EED5B7",
	"bisque3": "#CDB79E",
	"bisque4": "#8B7D6B",
	"peachpuff1": "#FFDAB9",
	"peachpuff2": "#EECBAD",
	"peachpuff3": "#CDAF95",
	"peachpuff4": "#8B7765",
	"navajowhite1": "#FFDEAD",
	"navajowhite2": "#EECFA1",
	"navajowhite3": "#CDB38B",
	"navajowhite4": "#8B795E",
	"lemonchiffon1": "#FFFACD",
	"lemonchiffon2": "#EEE9BF",
	"lemonchiffon3": "#CDC9A5",
	"lemonchiffon4": "#8B8970",
	"cornsilk1": "#FFF8DC",
	"cornsilk2": "#EEE8CD",
	"cornsilk3": "#CDC8B1",
	"cornsilk4": "#8B8878",
	"ivory1": "#FFFFF0",
	"ivory2": "#EEEEE0",
	"ivory3": "#CDCDC1",
	"ivory4": "#8B8B83",
	"honeydew1": "#F0FFF0",
	"honeydew2": "#E0EEE0",
	"honeydew3": "#C1CDC1",
	"honeydew4": "#838B83",
	"lavenderblush1": "#FFF0F5",
	"lavenderblush2": "#EEE0E5",
	"lavenderblush3": "#CDC1C5",
	"lavenderblush4": "#8B8386",
	"slategray4": "#6C7B8B",
	"lightsteelblue1": "#CAE1FF",
	"lightsteelblue2": "#BCD2EE",
	"lightsteelblue3": "#A2B5CD",
	"lightsteelblue4": "#6E7B8B",
	"lightblue1": "#BFEFFF",
	"lightblue2": "#B2DFEE",
	"lightblue3": "#9AC0CD",
	"lightblue4": "#68838B",
	"lightcyan1": "#E0FFFFv",
	"lightcyan2": "#D1EEEE",
	"lightcyan3": "#B4CDCD",
	"lightcyan4": "#7A8B8B",
	"paleturquoise1": "#BBFFFF",
	"paleturquoise2": "#AEEEEE",
	"paleturquoise3": "#96CDCD",
	"paleturquoise4": "#668B8B",
	"cadetblue1": "#98F5FF",
	"cadetblue2": "#8EE5EE",
	"cadetblue3": "#7AC5CD",
	"cadetblue4": "#53868B",
	"turquoise1": "#00F5FF",
	"turquoise2": "#00E5EE",
	"turquoise3": "#00C5CD",
	"turquoise4": "#00868B",
	"cyan1": "#00FFFF",
	"cyan2": "#00EEEE",
	"cyan3": "#00CDCD",
	"cyan4": "#008B8B",
	"darkslategray1": "#97FFFF",
	"darkslategray2": "#8DEEEE",
	"darkslategray3": "#79CDCD",
	"darkslategray4": "#528B8B",
	"aquamarine1": "#7FFFD4",
	"aquamarine2": "#76EEC6",
	"aquamarine3": "#66CDAA",
	"aquamarine4": "#458B74",
	"darkseagreen1": "#C1FFC1",
	"darkseagreen2": "#B4EEB4",
	"darkseagreen3": "#9BCD9B",
	"darkseagreen4": "#698B69",
	"seagreen1": "#54FF9F",
	"seagreen2": "#4EEE94",
	"mistyrose1": "#FFE4E1",
	"mistyrose2": "#EED5D2",
	"mistyrose3": "#CDB7B5",
	"mistyrose4": "#8B7D7B",
	"azure1": "#F0FFFF",
	"azure2": "#E0EEEE",
	"azure3": "#C1CDCD",
	"azure4": "#838B8B",
	"slateblue1": "#836FFF",
	"slateblue2": "#7A67EE",
	"slateblue3": "#6959CD",
	"slateblue4": "#473C8B",
	"royalblue1": "#4876FF",
	"royalblue2": "#436EEE",
	"royalblue3": "#3A5FCD",
	"royalblue4": "#27408B",
	"blue1": "#0000FF",
	"blue2": "#0000EE",
	"blue3": "#0000CD",
	"blue4": "#00008B",
	"dodgerblue1": "#1E90FF",
	"dodgerblue2": "#1C86EE",
	"dodgerblue3": "#1874CD",
	"dodgerblue4": "#104E8B",
	"steelblue1": "#63B8FF",
	"steelblue2": "#5CACEE",
	"steelblue3": "#4F94CD",
	"steelblue4": "#36648B",
	"deepskyblue1": "#00BFFF",
	"deepskyblue2": "#00B2EE",
	"deepskyblue3": "#009ACD",
	"deepskyblue4": "#00688B",
	"skyblue1": "#87CEFF",
	"skyblue2": "#7EC0EE",
	"skyblue3": "#6CA6CD",
	"skyblue4": "#4A708B",
	"lightskyblue1": "#B0E2FF",
	"lightskyblue2": "#A4D3EE",
	"lightskyblue3": "#8DB6CD",
	"lightskyblue4": "#607B8B",
	"slategray1": "#C6E2FF",
	"slategray2": "#B9D3EE",
	"slategray3": "#9FB6CD",
	"seagreen3": "#43CD80",
	"seagreen4": "#2E8B57",
	"palegreen1": "#9AFF9A",
	"palegreen2": "#90EE90",
	"palegreen3": "#7CCD7C",
	"palegreen4": "#548B54",
	"springgreen1": "#00FF7F",
	"springgreen2": "#00EE76",
	"springgreen3": "#00CD66",
	"springgreen4": "#008B45",
	"green1": "#00FF00",
	"green2": "#00EE00",
	"green3": "#00CD00",
	"green4": "#008B00",
	"chartreuse1": "#7FFF00",
	"chartreuse2": "#76EE00",
	"chartreuse3": "#66CD00",
	"chartreuse4": "#458B00",
	"olivedrab1": "#C0FF3E",
	"olivedrab2": "#B3EE3A",
	"olivedrab3": "#9ACD32",
	"olivedrab4": "#698B22",
	"darkolivegreen1": "#CAFF70",
	"darkolivegreen2": "#BCEE68",
	"darkolivegreen3": "#A2CD5A",
	"darkolivegreen4": "#6E8B3D",
	"khaki1": "#FFF68F",
	"khaki2": "#EEE685",
	"khaki3": "#CDC673",
	"khaki4": "#8B864E",
	"lightgoldenrod1": "#FFEC8B",
	"lightgoldenrod2": "#EEDC82",
	"lightgoldenrod3": "#CDBE70",
	"lightgoldenrod4": "#8B814C",
	"lightyellow1": "#FFFFE0",
	"lightyellow2": "#EEEED1",
	"lightyellow3": "#CDCDB4",
	"lightyellow4": "#8B8B7A",
	"yellow1": "#FFFF00",
	"yellow2": "#EEEE00",
	"yellow3": "#CDCD00",
	"yellow4": "#8B8B00",
	"gold1": "#FFD700",
	"gold3": "#CDAD00",
	"hotpink3": "#CD6090",
	"hotpink4": "#8B3A62",
	"pink1": "#FFB5C5",
	"pink2": "#EEA9B8",
	"pink3": "#CD919E",
	"pink4": "#8B636C",
	"lightpink1": "#FFAEB9",
	"lightpink2": "#EEA2AD",
	"lightpink3": "#CD8C95",
	"lightpink4": "#8B5F65",
	"palevioletred1": "#FF82AB",
	"palevioletred2": "#EE799F",
	"palevioletred3": "#CD6889",
	"palevioletred4": "#8B475D",
	"maroon1": "#FF34B3",
	"maroon2": "#EE30A7",
	"maroon3": "#CD2990",
	"maroon4": "#8B1C62",
	"violetred1": "#FF3E96",
	"violetred2": "#EE3A8C",
	"violetred3": "#CD3278",
	"violetred4": "#8B2252",
	"magenta1": "#FF00FF",
	"magenta2": "#EE00EE",
	"magenta3": "#CD00CD",
	"magenta4": "#8B008B",
	"orchid1": "#FF83FA",
	"orchid2": "#EE7AE9",
	"orchid3": "#CD69C9",
	"orchid4": "#8B4789",
	"plum1": "#FFBBFF",
	"plum2": "#EEAEEE",
	"plum3": "#CD96CD",
	"plum4": "#8B668B",
	"mediumorchid1": "#E066FF",
	"mediumorchid2": "#D15FEE",
	"mediumorchid3": "#B452CD",
	"mediumorchid4": "#7A378B",
	"darkorchid1": "#BF3EFF",
	"darkorchid2": "#B23AEE",
	"darkorchid3": "#9A32CD",
	"darkorchid4": "#68228B",
	"purple1": "#9B30FF",
	"purple2": "#912CEE",
	"firebrick4": "#8B1A1A",
	"brown1": "#FF4040",
	"brown2": "#EE3B3B",
	"brown3": "#CD3333",
	"brown4": "#8B2323",
	"salmon1": "#FF8C69",
	"salmon2": "#EE8262",
	"salmon3": "#CD7054",
	"salmon4": "#8B4C39",
	"lightsalmon1": "#FFA07A",
	"lightsalmon2": "#EE9572",
	"lightsalmon3": "#CD8162",
	"lightsalmon4": "#8B5742",
	"orange1": "#FFA500",
	"orange2": "#EE9A00",
	"orange3": "#CD8500",
	"orange4": "#8B5A00",
	"darkorange1": "#FF7F00",
	"darkorange2": "#EE7600",
	"darkorange3": "#CD6600",
	"darkorange4": "#8B4500",
	"coral1": "#FF7256",
	"coral2": "#EE6A50",
	"coral3": "#CD5B45",
	"coral4": "#8B3E2F",
	"tomato1": "#FF6347",
	"tomato2": "#EE5C42",
	"tomato3": "#CD4F39",
	"tomato4": "#8B3626",
	"orangered1": "#FF4500",
	"orangered2": "#EE4000",
	"orangered3": "#CD3700",
	"orangered4": "#8B2500",
	"red1": "#FF0000",
	"red2": "#EE0000",
	"red3": "#CD0000",
	"red4": "#8B0000",
	"deeppink1": "#FF1493",
	"deeppink2": "#EE1289",
	"deeppink3": "#CD1076",
	"deeppink4": "#8B0A50",
	"hotpink1": "#FF6EB4",
	"hotpink2": "#EE6AA7",
	"gold2": "#EEC900",
	"gold4": "#8B7500",
	"goldenrod1": "#FFC125",
	"goldenrod2": "#EEB422",
	"goldenrod3": "#CD9B1D",
	"goldenrod4": "#8B6914",
	"darkgoldenrod1": "#FFB90F",
	"darkgoldenrod2": "#EEAD0E",
	"darkgoldenrod3": "#CD950C",
	"darkgoldenrod4": "#8B658B",
	"rosybrown1": "#FFC1C1",
	"rosybrown2": "#EEB4B4",
	"rosybrown3": "#CD9B9B",
	"rosybrown4": "#8B6969",
	"indianred1": "#FF6A6A",
	"indianred2": "#EE6363",
	"indianred3": "#CD5555",
	"indianred4": "#8B3A3A",
	"sienna1": "#FF8247",
	"sienna2": "#EE7942",
	"sienna3": "#CD6839",
	"sienna4": "#8B4726",
	"burlywood1": "#FFD39B",
	"burlywood2": "#EEC591",
	"burlywood3": "#CDAA7D",
	"burlywood4": "#8B7355",
	"wheat1": "#FFE7BA",
	"wheat2": "#EED8AE",
	"wheat3": "#CDBA96",
	"wheat4": "#8B7E66",
	"tan1": "#FFA54F",
	"purple3": "#7D26CD",
	"purple4": "#551A8B",
	"mediumpurple1": "#AB82FF",
	"mediumpurple2": "#9F79EE",
	"mediumpurple3": "#8968CD",
	"mediumpurple4": "#5D478B",
	"thistle1": "#FFE1FF",
	"thistle2": "#EED2EE",
	"thistle3": "#CDB5CD",
	"thistle4": "#8B7B8B",
	"grey11": "#1C1C1C",
	"grey21": "#363636",
	"grey31": "#4F4F4F",
	"grey41": "#696969",
	"grey51": "#828282",
	"grey61": "#9C9C9C",
	"grey71": "#B5B5B5",
	"gray81": "#CFCFCF",
	"gray91": "#E8E8E8",
	"darkgrey": "#A9A9A9",
	"darkblue": "#00008B",
	"darkcyan": "#008B8B",
	"darkmagenta": "#8B008B",
	"darkred": "#8B0000",
	"lightgreen": "#90EE90",
	"chocolate3": "#CD661D",
	"chocolate4": "#8B4513",
	"firebrick1": "#FF3030",
	"firebrick2": "#EE2C2C",
	"firebrick3": "#CD2626",
	"gold4": "#8B7500",
	"goldenrod1": "#FFC125",
	"goldenrod2": "#EEB422",
	"goldenrod3": "#CD9B1D",
	"goldenrod4": "#8B6914",
	"darkgoldenrod1": "#FFB90F",
	"darkgoldenrod2": "#EEAD0E",
	"darkgoldenrod3": "#CD950C",
	"darkgoldenrod4": "#8B658B",
	"rosybrown1": "#FFC1C1",
	"rosybrown2": "#EEB4B4",
	"rosybrown3": "#CD9B9B",
	"rosybrown4": "#8B6969",
	"indianred1": "#FF6A6A",
	"indianred2": "#EE6363",
	"indianred3": "#CD5555",
	"indianred4": "#8B3A3A",
	"sienna1": "#FF8247",
	"sienna2": "#EE7942",
	"sienna3": "#CD6839",
	"sienna4": "#8B4726",
	"burlywood1": "#FFD39B",
	"burlywood2": "#EEC591",
	"burlywood3": "#CDAA7D",
	"burlywood4": "#8B7355",
	"tan2": "#EE9A49",
	"tan3": "#CD853F",
	"tan4": "#8B5A2B",
	"chocolate1": "#FF7F24",
	"chocolate2": "#EE7621"
};


JSS.prototype.ColorConvert = function(color){
	
	
	if(/^rgba?\s*\((.*)\)$/.test(color)){
		var rgba = /^rgba?\s*\((.*)\)$/.exec(color)[1];
		rgba = new Float32Array(rgba.split(","));
		
		var r = rgba[0];
		var g = rgba[1];
		var b = rgba[2];
		var a = rgba[3];
		
		r = +r;
		g = +g;
		b = +b;
		a = +a;
		
		return {r:r,g:g,b:b,a:a};
	}else if(/^hsla?\s*\((.*)\)$/.test(color)){
		var hsla = /^hsla?\s*\((.*)\)$/.exec(color)[1];
		hsla = hsla.split(",");
		
		
		
		var h = (parseInt(hsla[0]) % 360) / 360;
		var s = parseInt(hsla[1]) / 100;
		var l = parseInt(hsla[2]) / 100;
		var a = hsla[3];
		
		hsla = new Float32Array([h,s,l,a]);
		
		h = hsla[0];
		s = hsla[1];
		l = hsla[2];
		a = hsla[3];
		
		var lumia = l <= 0.5 ? l * (s + 1) : l + s - l * s;
		var lumia2 = l * 2 - lumia;
		
		
		function calcHue(h){
			h = ((h < 0) ? h + 1 : (h > 1 ? h - 1 : h));
			
			if(h * 6 < 1){ 
				return lumia2 + (lumia - lumia2) * h * 6;
			}else if(h * 2 < 1){
				return lumia;
			}else if(h * 3 < 2){
				return lumia2 + (lumia - lumia2) * (2/3 - h) * 6;
			}else{
				return lumia2;
			}
		}
		
		return {r:Math.round(calcHue(h + 1/3)*255),
				g:Math.round(calcHue(h)*255),
				b:Math.round(calcHue(h - 1/3)*255),
				a:a};
		
	}else if(/^rgb?\s*\((.*)\)$/.test(color)){
		var rgb = /^rgb?\s*\((.*)\)$/.exec(color)[1];
		rgb = new Float32Array(rgb.split(","));
		//console.log(rgb);
		var r = rgb[0];
		var g = rgb[1];
		var b = rgb[2];
		
		r = +r;
		g = +g;
		b = +b;
		
		return {r:r,g:g,b:b};
	}else if(/^hsl?\s*\((.*)\)$/.test(color)){
		var hsl = /^hsl?\s*\((.*)\)$/.exec(color)[1];
		hsl = hsl.split(",");
		
		var h = hsl[0];
		var s = hsl[1];
		var l = hsl[2];
		var a = 1;
		
		return JSS.prototype.ColorConvert("hsla("+h+", "+s+", "+l+", "+a+")");
		
	}else if(/^#\w{3}$/.test(color)){
		var hex = color.replace("#", "");
		
		var r = hex.substr(0,1);
		var g = hex.substr(1,1);
		var b = hex.substr(2,1);
		
		var rgb = new Float32Array([+("0x"+r+r), +("0x"+g+g), +("0x"+b+b)]);
		
		r = rgb[0];
		g = rgb[1];
		b = rgb[2];
		
		

		return {r:r,g:g,b:b,a:1};
	}else if(/^#\w{6}$/.test(color)){
		var hex = color.replace("#", "");
		
		var r = hex.substr(0,2);
		var g = hex.substr(2,2);
		var b = hex.substr(4,2);
		
		var rgb = new Float32Array([+("0x"+r), +("0x"+g), +("0x"+b)]);
		
		r = rgb[0];
		g = rgb[1];
		b = rgb[2];
		
		return {r:r,g:g,b:b,a:1};
	}else{
		
		var color = color.toLowerCase(),
			hexColor = this._colors[color];
			
		if(hexColor != undefined){
			return JSS.prototype.ColorConvert(hexColor);
		}else{
			console.error("The color '"+color+"' is not finded, then will be converted to white: #fff.");
			return JSS.prototype.ColorConvert("#fff");
		}
		
		/*
		switch(color.toLowerCase()){
			case "snow": return JSS.prototype.ColorConvert("#FFFAFA");break;
			case "ghostwhite": return JSS.prototype.ColorConvert("#F8F8FF");break;
			case "whitesmoke": return JSS.prototype.ColorConvert("#F5F5F5");break;
			case "gainsboro": return JSS.prototype.ColorConvert("#DCDCDC");break;
			case "floralwhite": return JSS.prototype.ColorConvert("#FFFAF0");break;
			case "oldlace": return JSS.prototype.ColorConvert("#FDF5E6");break;
			case "linen": return JSS.prototype.ColorConvert("#FAF0E6");break;
			case "antiquewhite": return JSS.prototype.ColorConvert("#FAEBD7");break;
			case "papayawhip": return JSS.prototype.ColorConvert("#FFEFD5");break;
			case "blanchedalmond": return JSS.prototype.ColorConvert("#FFEBCD");break;
			case "bisque": return JSS.prototype.ColorConvert("#FFE4C4");break;
			case "peachpuff": return JSS.prototype.ColorConvert("#FFDAB9");break;
			case "navajowhite": return JSS.prototype.ColorConvert("#FFDEAD");break;
			case "moccasin": return JSS.prototype.ColorConvert("#FFE4B5");break;
			case "cornsilk": return JSS.prototype.ColorConvert("#FFF8DC");break;
			case "ivory": return JSS.prototype.ColorConvert("#FFFFF0");break;
			case "lemonchiffon": return JSS.prototype.ColorConvert("#FFFACD");break;
			case "seashell": return JSS.prototype.ColorConvert("#FFF5EE");break;
			case "honeydew": return JSS.prototype.ColorConvert("#F0FFF0");break;
			case "mintcream": return JSS.prototype.ColorConvert("#F5FFFA");break;
			case "azure": return JSS.prototype.ColorConvert("#F0FFFF");break;
			case "aliceblue": return JSS.prototype.ColorConvert("#F0F8FF");break;
			case "lavender": return JSS.prototype.ColorConvert("#E6E6FA");break;
			case "lavenderblush": return JSS.prototype.ColorConvert("#FFF0F5");break;
			case "mistyrose": return JSS.prototype.ColorConvert("#FFE4E1");break;
			case "white": return JSS.prototype.ColorConvert("#FFFFFF");break;
			case "black": return JSS.prototype.ColorConvert("#000000");break;
			case "darkslategray": return JSS.prototype.ColorConvert("#2F4F4F");break;
			case "dimgrey": return JSS.prototype.ColorConvert("#696969");break;
			case "slategrey": return JSS.prototype.ColorConvert("#708090");break;
			case "lightslategray": return JSS.prototype.ColorConvert("#778899");break;
			case "grey": return JSS.prototype.ColorConvert("#BEBEBE");break;
			case "lightgray": return JSS.prototype.ColorConvert("#D3D3D3");break;
			case "midnightblue": return JSS.prototype.ColorConvert("#191970");break;
			case "navyblue": return JSS.prototype.ColorConvert("#000080");break;
			case "cornflowerblue": return JSS.prototype.ColorConvert("#6495ED");break;
			case "darkSlateblue": return JSS.prototype.ColorConvert("#483D8B");break;
			case "slateblue": return JSS.prototype.ColorConvert("#6A5ACD");break;
			case "mediumslateblue": return JSS.prototype.ColorConvert("#7B68EE");break;
			case "lightslateblue": return JSS.prototype.ColorConvert("#8470FF");break;
			case "mediumblue": return JSS.prototype.ColorConvert("#0000CD");break;
			case "royalblue": return JSS.prototype.ColorConvert("#4169E1");break;
			case "blue": return JSS.prototype.ColorConvert("#0000FF");break;
			case "dodgerblue": return JSS.prototype.ColorConvert("#1E90FF");break;
			case "deepskyblue": return JSS.prototype.ColorConvert("#00BFFF");break;
			case "skyblue": return JSS.prototype.ColorConvert("#87CEEB");break;
			case "lightskyblue": return JSS.prototype.ColorConvert("#87CEFA");break;
			case "steelblue": return JSS.prototype.ColorConvert("#4682B4");break;
			case "lightsteelblue": return JSS.prototype.ColorConvert("#B0C4DE");break;
			case "lightblue": return JSS.prototype.ColorConvert("#ADD8E6");break;
			case "powderblue": return JSS.prototype.ColorConvert("#B0E0E6");break;
			case "paleturquoise": return JSS.prototype.ColorConvert("#AFEEEE");break;
			case "darkturquoise": return JSS.prototype.ColorConvert("#00CED1");break;
			case "mediumturquoise": return JSS.prototype.ColorConvert("#48D1CC");break;
			case "turquoise": return JSS.prototype.ColorConvert("#40E0D0");break;
			case "cyan": return JSS.prototype.ColorConvert("#00FFFF");break;
			case "lightcyan": return JSS.prototype.ColorConvert("#E0FFFF");break;
			case "cadetblue": return JSS.prototype.ColorConvert("#5F9EA0");break;
			case "mediumaquamarine": return JSS.prototype.ColorConvert("#66CDAA");break;
			case "aquamarine": return JSS.prototype.ColorConvert("#7FFFD4");break;
			case "darkgreen": return JSS.prototype.ColorConvert("#006400");break;
			case "darkolivegreen": return JSS.prototype.ColorConvert("#556B2F");break;
			case "darkseagreen": return JSS.prototype.ColorConvert("#8FBC8F");break;
			case "seagreen": return JSS.prototype.ColorConvert("#2E8B57");break;
			case "mediumsseagreen": return JSS.prototype.ColorConvert("#3CB371");break;
			case "lightseagreen": return JSS.prototype.ColorConvert("#20B2AA");break;
			case "palegreen": return JSS.prototype.ColorConvert("#98FB98");break;
			case "springgreen": return JSS.prototype.ColorConvert("#00FF7F");break;
			case "lawngreen": return JSS.prototype.ColorConvert("#7CFC00");break;
			case "green": return JSS.prototype.ColorConvert("#00FF00");break;
			case "chartreuse": return JSS.prototype.ColorConvert("#7FFF00");break;
			case "medspringgreen": return JSS.prototype.ColorConvert("#00FA9A");break;
			case "greenyellow": return JSS.prototype.ColorConvert("#ADFF2F");break;
			case "limegreen": return JSS.prototype.ColorConvert("#32CD32");break;
			case "yellowgreen": return JSS.prototype.ColorConvert("#9ACD32");break;
			case "forestgreen": return JSS.prototype.ColorConvert("#228B22");break;
			case "olivedrab": return JSS.prototype.ColorConvert("#6B8E23");break;
			case "darkkhaki": return JSS.prototype.ColorConvert("#BDB76B");break;
			case "palegoldenrod": return JSS.prototype.ColorConvert("#EEE8AA");break;
			case "ltgoldenrodyello": return JSS.prototype.ColorConvert("#FAFAD2");break;
			case "lightyellow": return JSS.prototype.ColorConvert("#FFFFE0");break;
			case "yellow": return JSS.prototype.ColorConvert("#FFFF00");break;
			case "gold": return JSS.prototype.ColorConvert("#FFD700");break;
			case "lightgoldenrod": return JSS.prototype.ColorConvert("#EEDD82");break;
			case "goldenrod": return JSS.prototype.ColorConvert("#DAA520");break;
			case "darkgoldenrod": return JSS.prototype.ColorConvert("#B8860B");break;
			case "rosybrown": return JSS.prototype.ColorConvert("#BC8F8F");break;
			case "indianred": return JSS.prototype.ColorConvert("#CD5C5C");break;
			case "saddlebrown": return JSS.prototype.ColorConvert("#8B4513");break;
			case "sienna": return JSS.prototype.ColorConvert("#A0522D");break;
			case "peru": return JSS.prototype.ColorConvert("#CD853F");break;
			case "burlywood": return JSS.prototype.ColorConvert("#DEB887");break;
			case "beige": return JSS.prototype.ColorConvert("#F5F5DC");break;
			case "wheat": return JSS.prototype.ColorConvert("#F5DEB3");break;
			case "sandybrown": return JSS.prototype.ColorConvert("#F4A460");break;
			case "tan": return JSS.prototype.ColorConvert("#D2B48C");break;
			case "chocolate": return JSS.prototype.ColorConvert("#D2691E");break;
			case "firebrick": return JSS.prototype.ColorConvert("#B22222");break;
			case "brown": return JSS.prototype.ColorConvert("#A52A2A");break;
			case "darksalmon": return JSS.prototype.ColorConvert("#E9967A");break;
			case "salmon": return JSS.prototype.ColorConvert("#FA8072");break;
			case "lightsalmon": return JSS.prototype.ColorConvert("#FFA07A");break;
			case "orange": return JSS.prototype.ColorConvert("#FFA500");break;
			case "darkorange": return JSS.prototype.ColorConvert("#FF8C00");break;
			case "coral": return JSS.prototype.ColorConvert("#FF7F50");break;
			case "lightcoral": return JSS.prototype.ColorConvert("#F08080");break;
			case "tomato": return JSS.prototype.ColorConvert("#FF6347");break;
			case "orangered": return JSS.prototype.ColorConvert("#FF4500");break;
			case "red": return JSS.prototype.ColorConvert("#FF0000");break;
			case "hotpink": return JSS.prototype.ColorConvert("#FF69B4");break;
			case "deeppink": return JSS.prototype.ColorConvert("#FF1493");break;
			case "pink": return JSS.prototype.ColorConvert("#FFC0CB");break;
			case "lightpink": return JSS.prototype.ColorConvert("#FFB6C1");break;
			case "palevioletred": return JSS.prototype.ColorConvert("#DB7093");break;
			case "maroon": return JSS.prototype.ColorConvert("#B03060");break;
			case "mediumvioletred": return JSS.prototype.ColorConvert("#C71585");break;
			case "violetred": return JSS.prototype.ColorConvert("#D02090");break;
			case "magenta": return JSS.prototype.ColorConvert("#FF00FF");break;
			case "violet": return JSS.prototype.ColorConvert("#EE82EE");break;
			case "plum": return JSS.prototype.ColorConvert("#DDA0DD");break;
			case "orchid": return JSS.prototype.ColorConvert("#DA70D6");break;
			case "mediumorchid": return JSS.prototype.ColorConvert("#BA55D3");break;
			case "darkorchid": return JSS.prototype.ColorConvert("#9932CC");break;
			case "darkviolet": return JSS.prototype.ColorConvert("#9400D3");break;
			case "blueviolet": return JSS.prototype.ColorConvert("#8A2BE2");break;
			case "purple": return JSS.prototype.ColorConvert("#A020F0");break;
			case "mediumpurple": return JSS.prototype.ColorConvert("#9370DB");break;
			case "thistle": return JSS.prototype.ColorConvert("#D8BFD8");break;
			case "snow1": return JSS.prototype.ColorConvert("#FFFAFA");break;
			case "snow2": return JSS.prototype.ColorConvert("#EEE9E9");break;
			case "snow3": return JSS.prototype.ColorConvert("#CDC9C9");break;
			case "snow4": return JSS.prototype.ColorConvert("#8B8989");break;
			case "seashell1": return JSS.prototype.ColorConvert("#FFF5EE");break;
			case "seashell2": return JSS.prototype.ColorConvert("#EEE5DE");break;
			case "seashell3": return JSS.prototype.ColorConvert("#CDC5BF");break;
			case "seashell4": return JSS.prototype.ColorConvert("#8B8682");break;
			case "antiquewhite1": return JSS.prototype.ColorConvert("#FFEFDB");break;
			case "antiquewhite2": return JSS.prototype.ColorConvert("#EEDFCC");break;
			case "antiquewhite3": return JSS.prototype.ColorConvert("#CDC0B0");break;
			case "antiquewhite4": return JSS.prototype.ColorConvert("#8B8378");break;
			case "bisque1": return JSS.prototype.ColorConvert("#FFE4C4");break;
			case "bisque2": return JSS.prototype.ColorConvert("#EED5B7");break;
			case "bisque3": return JSS.prototype.ColorConvert("#CDB79E");break;
			case "bisque4": return JSS.prototype.ColorConvert("#8B7D6B");break;
			case "peachpuff1": return JSS.prototype.ColorConvert("#FFDAB9");break;
			case "peachpuff2": return JSS.prototype.ColorConvert("#EECBAD");break;
			case "peachpuff3": return JSS.prototype.ColorConvert("#CDAF95");break;
			case "peachpuff4": return JSS.prototype.ColorConvert("#8B7765");break;
			case "navajowhite1": return JSS.prototype.ColorConvert("#FFDEAD");break;
			case "navajowhite2": return JSS.prototype.ColorConvert("#EECFA1");break;
			case "navajowhite3": return JSS.prototype.ColorConvert("#CDB38B");break;
			case "navajowhite4": return JSS.prototype.ColorConvert("#8B795E");break;
			case "lemonchiffon1": return JSS.prototype.ColorConvert("#FFFACD");break;
			case "lemonchiffon2": return JSS.prototype.ColorConvert("#EEE9BF");break;
			case "lemonchiffon3": return JSS.prototype.ColorConvert("#CDC9A5");break;
			case "lemonchiffon4": return JSS.prototype.ColorConvert("#8B8970");break;
			case "cornsilk1": return JSS.prototype.ColorConvert("#FFF8DC");break;
			case "cornsilk2": return JSS.prototype.ColorConvert("#EEE8CD");break;
			case "cornsilk3": return JSS.prototype.ColorConvert("#CDC8B1");break;
			case "cornsilk4": return JSS.prototype.ColorConvert("#8B8878");break;
			case "ivory1": return JSS.prototype.ColorConvert("#FFFFF0");break;
			case "ivory2": return JSS.prototype.ColorConvert("#EEEEE0");break;
			case "ivory3": return JSS.prototype.ColorConvert("#CDCDC1");break;
			case "ivory4": return JSS.prototype.ColorConvert("#8B8B83");break;
			case "honeydew1": return JSS.prototype.ColorConvert("#F0FFF0");break;
			case "honeydew2": return JSS.prototype.ColorConvert("#E0EEE0");break;
			case "honeydew3": return JSS.prototype.ColorConvert("#C1CDC1");break;
			case "honeydew4": return JSS.prototype.ColorConvert("#838B83");break;
			case "lavenderblush1": return JSS.prototype.ColorConvert("#FFF0F5");break;
			case "lavenderblush2": return JSS.prototype.ColorConvert("#EEE0E5");break;
			case "lavenderblush3": return JSS.prototype.ColorConvert("#CDC1C5");break;
			case "lavenderblush4": return JSS.prototype.ColorConvert("#8B8386");break;
			case "slategray4": return JSS.prototype.ColorConvert("#6C7B8B");break;
			case "lightsteelblue1": return JSS.prototype.ColorConvert("#CAE1FF");break;
			case "lightsteelblue2": return JSS.prototype.ColorConvert("#BCD2EE");break;
			case "lightsteelblue3": return JSS.prototype.ColorConvert("#A2B5CD");break;
			case "lightsteelblue4": return JSS.prototype.ColorConvert("#6E7B8B");break;
			case "lightblue1": return JSS.prototype.ColorConvert("#BFEFFF");break;
			case "lightblue2": return JSS.prototype.ColorConvert("#B2DFEE");break;
			case "lightblue3": return JSS.prototype.ColorConvert("#9AC0CD");break;
			case "lightblue4": return JSS.prototype.ColorConvert("#68838B");break;
			case "lightcyan1": return JSS.prototype.ColorConvert("#E0FFFFv");break;
			case "lightcyan2": return JSS.prototype.ColorConvert("#D1EEEE");break;
			case "lightcyan3": return JSS.prototype.ColorConvert("#B4CDCD");break;
			case "lightcyan4": return JSS.prototype.ColorConvert("#7A8B8B");break;
			case "paleturquoise1": return JSS.prototype.ColorConvert("#BBFFFF");break;
			case "paleturquoise2": return JSS.prototype.ColorConvert("#AEEEEE");break;
			case "paleturquoise3": return JSS.prototype.ColorConvert("#96CDCD");break;
			case "paleturquoise4": return JSS.prototype.ColorConvert("#668B8B");break;
			case "cadetblue1": return JSS.prototype.ColorConvert("#98F5FF");break;
			case "cadetblue2": return JSS.prototype.ColorConvert("#8EE5EE");break;
			case "cadetblue3": return JSS.prototype.ColorConvert("#7AC5CD");break;
			case "cadetblue4": return JSS.prototype.ColorConvert("#53868B");break;
			case "turquoise1": return JSS.prototype.ColorConvert("#00F5FF");break;
			case "turquoise2": return JSS.prototype.ColorConvert("#00E5EE");break;
			case "turquoise3": return JSS.prototype.ColorConvert("#00C5CD");break;
			case "turquoise4": return JSS.prototype.ColorConvert("#00868B");break;
			case "cyan1": return JSS.prototype.ColorConvert("#00FFFF");break;
			case "cyan2": return JSS.prototype.ColorConvert("#00EEEE");break;
			case "cyan3": return JSS.prototype.ColorConvert("#00CDCD");break;
			case "cyan4": return JSS.prototype.ColorConvert("#008B8B");break;
			case "darkslategray1": return JSS.prototype.ColorConvert("#97FFFF");break;
			case "darkslategray2": return JSS.prototype.ColorConvert("#8DEEEE");break;
			case "darkslategray3": return JSS.prototype.ColorConvert("#79CDCD");break;
			case "darkslategray4": return JSS.prototype.ColorConvert("#528B8B");break;
			case "aquamarine1": return JSS.prototype.ColorConvert("#7FFFD4");break;
			case "aquamarine2": return JSS.prototype.ColorConvert("#76EEC6");break;
			case "aquamarine3": return JSS.prototype.ColorConvert("#66CDAA");break;
			case "aquamarine4": return JSS.prototype.ColorConvert("#458B74");break;
			case "darkseagreen1": return JSS.prototype.ColorConvert("#C1FFC1");break;
			case "darkseagreen2": return JSS.prototype.ColorConvert("#B4EEB4");break;
			case "darkseagreen3": return JSS.prototype.ColorConvert("#9BCD9B");break;
			case "darkseagreen4": return JSS.prototype.ColorConvert("#698B69");break;
			case "seagreen1": return JSS.prototype.ColorConvert("#54FF9F");break;
			case "seagreen2": return JSS.prototype.ColorConvert("#4EEE94");break;
			case "mistyrose1": return JSS.prototype.ColorConvert("#FFE4E1");break;
			case "mistyrose2": return JSS.prototype.ColorConvert("#EED5D2");break;
			case "mistyrose3": return JSS.prototype.ColorConvert("#CDB7B5");break;
			case "mistyrose4": return JSS.prototype.ColorConvert("#8B7D7B");break;
			case "azure1": return JSS.prototype.ColorConvert("#F0FFFF");break;
			case "azure2": return JSS.prototype.ColorConvert("#E0EEEE");break;
			case "azure3": return JSS.prototype.ColorConvert("#C1CDCD");break;
			case "azure4": return JSS.prototype.ColorConvert("#838B8B");break;
			case "slateblue1": return JSS.prototype.ColorConvert("#836FFF");break;
			case "slateblue2": return JSS.prototype.ColorConvert("#7A67EE");break;
			case "slateblue3": return JSS.prototype.ColorConvert("#6959CD");break;
			case "slateblue4": return JSS.prototype.ColorConvert("#473C8B");break;
			case "royalblue1": return JSS.prototype.ColorConvert("#4876FF");break;
			case "royalblue2": return JSS.prototype.ColorConvert("#436EEE");break;
			case "royalblue3": return JSS.prototype.ColorConvert("#3A5FCD");break;
			case "royalblue4": return JSS.prototype.ColorConvert("#27408B");break;
			case "blue1": return JSS.prototype.ColorConvert("#0000FF");break;
			case "blue2": return JSS.prototype.ColorConvert("#0000EE");break;
			case "blue3": return JSS.prototype.ColorConvert("#0000CD");break;
			case "blue4": return JSS.prototype.ColorConvert("#00008B");break;
			case "dodgerblue1": return JSS.prototype.ColorConvert("#1E90FF");break;
			case "dodgerblue2": return JSS.prototype.ColorConvert("#1C86EE");break;
			case "dodgerblue3": return JSS.prototype.ColorConvert("#1874CD");break;
			case "dodgerblue4": return JSS.prototype.ColorConvert("#104E8B");break;
			case "steelblue1": return JSS.prototype.ColorConvert("#63B8FF");break;
			case "steelblue2": return JSS.prototype.ColorConvert("#5CACEE");break;
			case "steelblue3": return JSS.prototype.ColorConvert("#4F94CD");break;
			case "steelblue4": return JSS.prototype.ColorConvert("#36648B");break;
			case "deepskyblue1": return JSS.prototype.ColorConvert("#00BFFF");break;
			case "deepskyblue2": return JSS.prototype.ColorConvert("#00B2EE");break;
			case "deepskyblue3": return JSS.prototype.ColorConvert("#009ACD");break;
			case "deepskyblue4": return JSS.prototype.ColorConvert("#00688B");break;
			case "skyblue1": return JSS.prototype.ColorConvert("#87CEFF");break;
			case "skyblue2": return JSS.prototype.ColorConvert("#7EC0EE");break;
			case "skyblue3": return JSS.prototype.ColorConvert("#6CA6CD");break;
			case "skyblue4": return JSS.prototype.ColorConvert("#4A708B");break;
			case "lightskyblue1": return JSS.prototype.ColorConvert("#B0E2FF");break;
			case "lightskyblue2": return JSS.prototype.ColorConvert("#A4D3EE");break;
			case "lightskyblue3": return JSS.prototype.ColorConvert("#8DB6CD");break;
			case "lightskyblue4": return JSS.prototype.ColorConvert("#607B8B");break;
			case "slategray1": return JSS.prototype.ColorConvert("#C6E2FF");break;
			case "slategray2": return JSS.prototype.ColorConvert("#B9D3EE");break;
			case "slategray3": return JSS.prototype.ColorConvert("#9FB6CD");break;
			case "seagreen3": return JSS.prototype.ColorConvert("#43CD80");break;
			case "seagreen4": return JSS.prototype.ColorConvert("#2E8B57");break;
			case "palegreen1": return JSS.prototype.ColorConvert("#9AFF9A");break;
			case "palegreen2": return JSS.prototype.ColorConvert("#90EE90");break;
			case "palegreen3": return JSS.prototype.ColorConvert("#7CCD7C");break;
			case "palegreen4": return JSS.prototype.ColorConvert("#548B54");break;
			case "springgreen1": return JSS.prototype.ColorConvert("#00FF7F");break;
			case "springgreen2": return JSS.prototype.ColorConvert("#00EE76");break;
			case "springgreen3": return JSS.prototype.ColorConvert("#00CD66");break;
			case "springgreen4": return JSS.prototype.ColorConvert("#008B45");break;
			case "green1": return JSS.prototype.ColorConvert("#00FF00");break;
			case "green2": return JSS.prototype.ColorConvert("#00EE00");break;
			case "green3": return JSS.prototype.ColorConvert("#00CD00");break;
			case "green4": return JSS.prototype.ColorConvert("#008B00");break;
			case "chartreuse1": return JSS.prototype.ColorConvert("#7FFF00");break;
			case "chartreuse2": return JSS.prototype.ColorConvert("#76EE00");break;
			case "chartreuse3": return JSS.prototype.ColorConvert("#66CD00");break;
			case "chartreuse4": return JSS.prototype.ColorConvert("#458B00");break;
			case "olivedrab1": return JSS.prototype.ColorConvert("#C0FF3E");break;
			case "olivedrab2": return JSS.prototype.ColorConvert("#B3EE3A");break;
			case "olivedrab3": return JSS.prototype.ColorConvert("#9ACD32");break;
			case "olivedrab4": return JSS.prototype.ColorConvert("#698B22");break;
			case "darkolivegreen1": return JSS.prototype.ColorConvert("#CAFF70");break;
			case "darkolivegreen2": return JSS.prototype.ColorConvert("#BCEE68");break;
			case "darkolivegreen3": return JSS.prototype.ColorConvert("#A2CD5A");break;
			case "darkolivegreen4": return JSS.prototype.ColorConvert("#6E8B3D");break;
			case "khaki1": return JSS.prototype.ColorConvert("#FFF68F");break;
			case "khaki2": return JSS.prototype.ColorConvert("#EEE685");break;
			case "khaki3": return JSS.prototype.ColorConvert("#CDC673");break;
			case "khaki4": return JSS.prototype.ColorConvert("#8B864E");break;
			case "lightgoldenrod1": return JSS.prototype.ColorConvert("#FFEC8B");break;
			case "lightgoldenrod2": return JSS.prototype.ColorConvert("#EEDC82");break;
			case "lightgoldenrod3": return JSS.prototype.ColorConvert("#CDBE70");break;
			case "lightgoldenrod4": return JSS.prototype.ColorConvert("#8B814C");break;
			case "lightyellow1": return JSS.prototype.ColorConvert("#FFFFE0");break;
			case "lightyellow2": return JSS.prototype.ColorConvert("#EEEED1");break;
			case "lightyellow3": return JSS.prototype.ColorConvert("#CDCDB4");break;
			case "lightyellow4": return JSS.prototype.ColorConvert("#8B8B7A");break;
			case "yellow1": return JSS.prototype.ColorConvert("#FFFF00");break;
			case "yellow2": return JSS.prototype.ColorConvert("#EEEE00");break;
			case "yellow3": return JSS.prototype.ColorConvert("#CDCD00");break;
			case "yellow4": return JSS.prototype.ColorConvert("#8B8B00");break;
			case "gold1": return JSS.prototype.ColorConvert("#FFD700");break;
			case "gold3": return JSS.prototype.ColorConvert("#CDAD00");break;
			case "hotpink3": return JSS.prototype.ColorConvert("#CD6090");break;
			case "hotpink4": return JSS.prototype.ColorConvert("#8B3A62");break;
			case "pink1": return JSS.prototype.ColorConvert("#FFB5C5");break;
			case "pink2": return JSS.prototype.ColorConvert("#EEA9B8");break;
			case "pink3": return JSS.prototype.ColorConvert("#CD919E");break;
			case "pink4": return JSS.prototype.ColorConvert("#8B636C");break;
			case "lightpink1": return JSS.prototype.ColorConvert("#FFAEB9");break;
			case "lightpink2": return JSS.prototype.ColorConvert("#EEA2AD");break;
			case "lightpink3": return JSS.prototype.ColorConvert("#CD8C95");break;
			case "lightpink4": return JSS.prototype.ColorConvert("#8B5F65");break;
			case "palevioletred1": return JSS.prototype.ColorConvert("#FF82AB");break;
			case "palevioletred2": return JSS.prototype.ColorConvert("#EE799F");break;
			case "palevioletred3": return JSS.prototype.ColorConvert("#CD6889");break;
			case "palevioletred4": return JSS.prototype.ColorConvert("#8B475D");break;
			case "maroon1": return JSS.prototype.ColorConvert("#FF34B3");break;
			case "maroon2": return JSS.prototype.ColorConvert("#EE30A7");break;
			case "maroon3": return JSS.prototype.ColorConvert("#CD2990");break;
			case "maroon4": return JSS.prototype.ColorConvert("#8B1C62");break;
			case "violetred1": return JSS.prototype.ColorConvert("#FF3E96");break;
			case "violetred2": return JSS.prototype.ColorConvert("#EE3A8C");break;
			case "violetred3": return JSS.prototype.ColorConvert("#CD3278");break;
			case "violetred4": return JSS.prototype.ColorConvert("#8B2252");break;
			case "magenta1": return JSS.prototype.ColorConvert("#FF00FF");break;
			case "magenta2": return JSS.prototype.ColorConvert("#EE00EE");break;
			case "magenta3": return JSS.prototype.ColorConvert("#CD00CD");break;
			case "magenta4": return JSS.prototype.ColorConvert("#8B008B");break;
			case "orchid1": return JSS.prototype.ColorConvert("#FF83FA");break;
			case "orchid2": return JSS.prototype.ColorConvert("#EE7AE9");break;
			case "orchid3": return JSS.prototype.ColorConvert("#CD69C9");break;
			case "orchid4": return JSS.prototype.ColorConvert("#8B4789");break;
			case "plum1": return JSS.prototype.ColorConvert("#FFBBFF");break;
			case "plum2": return JSS.prototype.ColorConvert("#EEAEEE");break;
			case "plum3": return JSS.prototype.ColorConvert("#CD96CD");break;
			case "plum4": return JSS.prototype.ColorConvert("#8B668B");break;
			case "mediumorchid1": return JSS.prototype.ColorConvert("#E066FF");break;
			case "mediumorchid2": return JSS.prototype.ColorConvert("#D15FEE");break;
			case "mediumorchid3": return JSS.prototype.ColorConvert("#B452CD");break;
			case "mediumorchid4": return JSS.prototype.ColorConvert("#7A378B");break;
			case "darkorchid1": return JSS.prototype.ColorConvert("#BF3EFF");break;
			case "darkorchid2": return JSS.prototype.ColorConvert("#B23AEE");break;
			case "darkorchid3": return JSS.prototype.ColorConvert("#9A32CD");break;
			case "darkorchid4": return JSS.prototype.ColorConvert("#68228B");break;
			case "purple1": return JSS.prototype.ColorConvert("#9B30FF");break;
			case "purple2": return JSS.prototype.ColorConvert("#912CEE");break;
			case "firebrick4": return JSS.prototype.ColorConvert("#8B1A1A");break;
			case "brown1": return JSS.prototype.ColorConvert("#FF4040");break;
			case "brown2": return JSS.prototype.ColorConvert("#EE3B3B");break;
			case "brown3": return JSS.prototype.ColorConvert("#CD3333");break;
			case "brown4": return JSS.prototype.ColorConvert("#8B2323");break;
			case "salmon1": return JSS.prototype.ColorConvert("#FF8C69");break;
			case "salmon2": return JSS.prototype.ColorConvert("#EE8262");break;
			case "salmon3": return JSS.prototype.ColorConvert("#CD7054");break;
			case "salmon4": return JSS.prototype.ColorConvert("#8B4C39");break;
			case "lightsalmon1": return JSS.prototype.ColorConvert("#FFA07A");break;
			case "lightsalmon2": return JSS.prototype.ColorConvert("#EE9572");break;
			case "lightsalmon3": return JSS.prototype.ColorConvert("#CD8162");break;
			case "lightsalmon4": return JSS.prototype.ColorConvert("#8B5742");break;
			case "orange1": return JSS.prototype.ColorConvert("#FFA500");break;
			case "orange2": return JSS.prototype.ColorConvert("#EE9A00");break;
			case "orange3": return JSS.prototype.ColorConvert("#CD8500");break;
			case "orange4": return JSS.prototype.ColorConvert("#8B5A00");break;
			case "darkorange1": return JSS.prototype.ColorConvert("#FF7F00");break;
			case "darkorange2": return JSS.prototype.ColorConvert("#EE7600");break;
			case "darkorange3": return JSS.prototype.ColorConvert("#CD6600");break;
			case "darkorange4": return JSS.prototype.ColorConvert("#8B4500");break;
			case "coral1": return JSS.prototype.ColorConvert("#FF7256");break;
			case "coral2": return JSS.prototype.ColorConvert("#EE6A50");break;
			case "coral3": return JSS.prototype.ColorConvert("#CD5B45");break;
			case "coral4": return JSS.prototype.ColorConvert("#8B3E2F");break;
			case "tomato1": return JSS.prototype.ColorConvert("#FF6347");break;
			case "tomato2": return JSS.prototype.ColorConvert("#EE5C42");break;
			case "tomato3": return JSS.prototype.ColorConvert("#CD4F39");break;
			case "tomato4": return JSS.prototype.ColorConvert("#8B3626");break;
			case "orangered1": return JSS.prototype.ColorConvert("#FF4500");break;
			case "orangered2": return JSS.prototype.ColorConvert("#EE4000");break;
			case "orangered3": return JSS.prototype.ColorConvert("#CD3700");break;
			case "orangered4": return JSS.prototype.ColorConvert("#8B2500");break;
			case "red1": return JSS.prototype.ColorConvert("#FF0000");break;
			case "red2": return JSS.prototype.ColorConvert("#EE0000");break;
			case "red3": return JSS.prototype.ColorConvert("#CD0000");break;
			case "red4": return JSS.prototype.ColorConvert("#8B0000");break;
			case "deeppink1": return JSS.prototype.ColorConvert("#FF1493");break;
			case "deeppink2": return JSS.prototype.ColorConvert("#EE1289");break;
			case "deeppink3": return JSS.prototype.ColorConvert("#CD1076");break;
			case "deeppink4": return JSS.prototype.ColorConvert("#8B0A50");break;
			case "hotpink1": return JSS.prototype.ColorConvert("#FF6EB4");break;
			case "hotpink2": return JSS.prototype.ColorConvert("#EE6AA7");break;
			case "gold2": return JSS.prototype.ColorConvert("#EEC900");break;
			case "gold4": return JSS.prototype.ColorConvert("#8B7500");break;
			case "goldenrod1": return JSS.prototype.ColorConvert("#FFC125");break;
			case "goldenrod2": return JSS.prototype.ColorConvert("#EEB422");break;
			case "goldenrod3": return JSS.prototype.ColorConvert("#CD9B1D");break;
			case "goldenrod4": return JSS.prototype.ColorConvert("#8B6914");break;
			case "darkgoldenrod1": return JSS.prototype.ColorConvert("#FFB90F");break;
			case "darkgoldenrod2": return JSS.prototype.ColorConvert("#EEAD0E");break;
			case "darkgoldenrod3": return JSS.prototype.ColorConvert("#CD950C");break;
			case "darkgoldenrod4": return JSS.prototype.ColorConvert("#8B658B");break;
			case "rosybrown1": return JSS.prototype.ColorConvert("#FFC1C1");break;
			case "rosybrown2": return JSS.prototype.ColorConvert("#EEB4B4");break;
			case "rosybrown3": return JSS.prototype.ColorConvert("#CD9B9B");break;
			case "rosybrown4": return JSS.prototype.ColorConvert("#8B6969");break;
			case "indianred1": return JSS.prototype.ColorConvert("#FF6A6A");break;
			case "indianred2": return JSS.prototype.ColorConvert("#EE6363");break;
			case "indianred3": return JSS.prototype.ColorConvert("#CD5555");break;
			case "indianred4": return JSS.prototype.ColorConvert("#8B3A3A");break;
			case "sienna1": return JSS.prototype.ColorConvert("#FF8247");break;
			case "sienna2": return JSS.prototype.ColorConvert("#EE7942");break;
			case "sienna3": return JSS.prototype.ColorConvert("#CD6839");break;
			case "sienna4": return JSS.prototype.ColorConvert("#8B4726");break;
			case "burlywood1": return JSS.prototype.ColorConvert("#FFD39B");break;
			case "burlywood2": return JSS.prototype.ColorConvert("#EEC591");break;
			case "burlywood3": return JSS.prototype.ColorConvert("#CDAA7D");break;
			case "burlywood4": return JSS.prototype.ColorConvert("#8B7355");break;
			case "wheat1": return JSS.prototype.ColorConvert("#FFE7BA");break;
			case "wheat2": return JSS.prototype.ColorConvert("#EED8AE");break;
			case "wheat3": return JSS.prototype.ColorConvert("#CDBA96");break;
			case "wheat4": return JSS.prototype.ColorConvert("#8B7E66");break;
			case "tan1": return JSS.prototype.ColorConvert("#FFA54F");break;
			case "purple3": return JSS.prototype.ColorConvert("#7D26CD");break;
			case "purple4": return JSS.prototype.ColorConvert("#551A8B");break;
			case "mediumpurple1": return JSS.prototype.ColorConvert("#AB82FF");break;
			case "mediumpurple2": return JSS.prototype.ColorConvert("#9F79EE");break;
			case "mediumpurple3": return JSS.prototype.ColorConvert("#8968CD");break;
			case "mediumpurple4": return JSS.prototype.ColorConvert("#5D478B");break;
			case "thistle1": return JSS.prototype.ColorConvert("#FFE1FF");break;
			case "thistle2": return JSS.prototype.ColorConvert("#EED2EE");break;
			case "thistle3": return JSS.prototype.ColorConvert("#CDB5CD");break;
			case "thistle4": return JSS.prototype.ColorConvert("#8B7B8B");break;
			case "grey11": return JSS.prototype.ColorConvert("#1C1C1C");break;
			case "grey21": return JSS.prototype.ColorConvert("#363636");break;
			case "grey31": return JSS.prototype.ColorConvert("#4F4F4F");break;
			case "grey41": return JSS.prototype.ColorConvert("#696969");break;
			case "grey51": return JSS.prototype.ColorConvert("#828282");break;
			case "grey61": return JSS.prototype.ColorConvert("#9C9C9C");break;
			case "grey71": return JSS.prototype.ColorConvert("#B5B5B5");break;
			case "gray81": return JSS.prototype.ColorConvert("#CFCFCF");break;
			case "gray91": return JSS.prototype.ColorConvert("#E8E8E8");break;
			case "darkgrey": return JSS.prototype.ColorConvert("#A9A9A9");break;
			case "darkblue": return JSS.prototype.ColorConvert("#00008B");break;
			case "darkcyan": return JSS.prototype.ColorConvert("#008B8B");break;
			case "darkmagenta": return JSS.prototype.ColorConvert("#8B008B");break;
			case "darkred": return JSS.prototype.ColorConvert("#8B0000");break;
			case "lightgreen": return JSS.prototype.ColorConvert("#90EE90");break;
			case "chocolate3": return JSS.prototype.ColorConvert("#CD661D");break;
			case "chocolate4": return JSS.prototype.ColorConvert("#8B4513");break;
			case "firebrick1": return JSS.prototype.ColorConvert("#FF3030");break;
			case "firebrick2": return JSS.prototype.ColorConvert("#EE2C2C");break;
			case "firebrick3": return JSS.prototype.ColorConvert("#CD2626");break;
			case "gold4": return JSS.prototype.ColorConvert("#8B7500");break;
			case "goldenrod1": return JSS.prototype.ColorConvert("#FFC125");break;
			case "goldenrod2": return JSS.prototype.ColorConvert("#EEB422");break;
			case "goldenrod3": return JSS.prototype.ColorConvert("#CD9B1D");break;
			case "goldenrod4": return JSS.prototype.ColorConvert("#8B6914");break;
			case "darkgoldenrod1": return JSS.prototype.ColorConvert("#FFB90F");break;
			case "darkgoldenrod2": return JSS.prototype.ColorConvert("#EEAD0E");break;
			case "darkgoldenrod3": return JSS.prototype.ColorConvert("#CD950C");break;
			case "darkgoldenrod4": return JSS.prototype.ColorConvert("#8B658B");break;
			case "rosybrown1": return JSS.prototype.ColorConvert("#FFC1C1");break;
			case "rosybrown2": return JSS.prototype.ColorConvert("#EEB4B4");break;
			case "rosybrown3": return JSS.prototype.ColorConvert("#CD9B9B");break;
			case "rosybrown4": return JSS.prototype.ColorConvert("#8B6969");break;
			case "indianred1": return JSS.prototype.ColorConvert("#FF6A6A");break;
			case "indianred2": return JSS.prototype.ColorConvert("#EE6363");break;
			case "indianred3": return JSS.prototype.ColorConvert("#CD5555");break;
			case "indianred4": return JSS.prototype.ColorConvert("#8B3A3A");break;
			case "sienna1": return JSS.prototype.ColorConvert("#FF8247");break;
			case "sienna2": return JSS.prototype.ColorConvert("#EE7942");break;
			case "sienna3": return JSS.prototype.ColorConvert("#CD6839");break;
			case "sienna4": return JSS.prototype.ColorConvert("#8B4726");break;
			case "burlywood1": return JSS.prototype.ColorConvert("#FFD39B");break;
			case "burlywood2": return JSS.prototype.ColorConvert("#EEC591");break;
			case "burlywood3": return JSS.prototype.ColorConvert("#CDAA7D");break;
			case "burlywood4": return JSS.prototype.ColorConvert("#8B7355");break;
			case "tan2": return JSS.prototype.ColorConvert("#EE9A49");break;
			case "tan3": return JSS.prototype.ColorConvert("#CD853F");break;
			case "tan4": return JSS.prototype.ColorConvert("#8B5A2B");break;
			case "chocolate1": return JSS.prototype.ColorConvert("#FF7F24");break;
			case "chocolate2": return JSS.prototype.ColorConvert("#EE7621");break;

		}*/
	}
}


JSS.GetDistanceColor = function(color1, color2){
	
	var Color1 = (color1 instanceof JSS.Color ? color1 : new JSS.Color(color1));
	var Color2 = (color2 instanceof JSS.Color ? color2 : new JSS.Color(color2));
	
	var rgba1 = (Color1.color.r != undefined ? Color1.color : Color1.toRGBA());
	var rgba2 = (Color2.color.r != undefined ? Color2.color : Color2.toRGBA());
	
	return Math.sqrt(Math.pow(rgba1.r - rgba2.r, 2) + Math.pow(rgba1.g - rgba2.g, 2) + Math.pow(rgba1.b - rgba2.b, 2));
}


JSS.Mix = function(color1, color2, weight){
	
	var Color1 = (color1 instanceof JSS.Color ? color1 : new JSS.Color(color1));
	var Color2 = (color2 instanceof JSS.Color ? color2 : new JSS.Color(color2));
	
	var rgba1 = (Color1.color.r != undefined ? Color1.color : Color1.toRGBA());
	var rgba2 = (Color2.color.r != undefined ? Color2.color : Color2.toRGBA());

	if (!weight) {
    	weight = 50;
    }
    
    var p = weight / 100.0;
    var w = p * 2 - 1;
    var a = rgba1.a - rgba2.a;

    var w1 = (((w * a == -1) ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
    var w2 = 1 - w1;

    var newColor = {r:rgba2.r * w1 + rgba1.r * w2,
               		g:rgba2.g * w1 + rgba1.g * w2,
               		b:rgba2.b * w1 + rgba1.b * w2,
               		a:rgba2.a/* * p + rgba1.a * (1 - p)*/};

    var Color3 = new JSS.Color(newColor);
	Color3.format = "rgba";	
	return Color3;
}


JSS.Ligthen = function(color, percent){
/*	var hsla = JSS.prototype.toHsla(color);
	hsla.l += percent;*/
	
	var Color = new JSS.Color(color);
	var hsla = Color.toHSLA();
	hsla.l += percent;
	Color.color = hsla;
	
	return Color;
}

JSS.Darken = function(color, percent){
		
	var Color = new JSS.Color(color);
	var hsla = Color.toHSLA();
	hsla.l -= percent;
	Color.color = hsla;
	
	return Color;
}

JSS.Multiply = function(color1, color2) {
	
	var Color1 = (color1 instanceof JSS.Color ? color1 : new JSS.Color(color1));
	var Color2 = (color2 instanceof JSS.Color ? color2 : new JSS.Color(color2));
	
	var rgba1 = (Color1.color.r != undefined ? Color1.color : Color1.toRGBA());
	var rgba2 = (Color2.color.r != undefined ? Color2.color : Color2.toRGBA());

	
	var r = Math.round((rgba1.r + rgba2.r) / 2);
	var g = Math.round((rgba1.g + rgba2.g) / 2);
	var b = Math.round((rgba1.b + rgba2.b) / 2);
	var a = (rgba1.a + rgba2.a) / 2;
	
	var Color3 = new JSS.Color({r:r,
    							g:g,
    							b:b,
    							a:a});
	Color3.format = "rgba";	
	return Color3;
}

JSS.Screen = function(color1, color2) {
	
	var Color1 = (color1 instanceof JSS.Color ? color1 : new JSS.Color(color1));
	var Color2 = (color2 instanceof JSS.Color ? color2 : new JSS.Color(color2));
	
	var rgba1 = (Color1.color.r != undefined ? Color1.color : Color1.toRGBA());
	var rgba2 = (Color2.color.r != undefined ? Color2.color : Color2.toRGBA());
	
    var r = 255 - (255 - rgba1.r) * (255 - rgba2.r) / 255;
    var g = 255 - (255 - rgba1.g) * (255 - rgba2.g) / 255;
    var b = 255 - (255 - rgba1.b) * (255 - rgba2.b) / 255;
    var a = (rgba1.a + rgba2.a) / 2;
    
    
    var Color3 = new JSS.Color({r:r,
    							g:g,
    							b:b,
    							a:a});
    Color3.format = "rgba";
    return Color3;
}

JSS.Overlay = function(color1, color2) {
	
	var Color1 = (color1 instanceof JSS.Color ? color1 : new JSS.Color(color1));
	var Color2 = (color2 instanceof JSS.Color ? color2 : new JSS.Color(color2));
	
	var rgba1 = (Color1.color.r != undefined ? Color1.color : Color1.toRGBA());
	var rgba2 = (Color2.color.r != undefined ? Color2.color : Color2.toRGBA());
	
	
    var r = rgba1.r < 128 ? 2 * rgba1.r * rgba2.r / 255 : 255 - 2 * (255 - rgba1.r) * (255 - rgba2.r) / 255;
    var g = rgba1.g < 128 ? 2 * rgba1.g * rgba2.g / 255 : 255 - 2 * (255 - rgba1.g) * (255 - rgba2.g) / 255;
    var b = rgba1.b < 128 ? 2 * rgba1.b * rgba2.b / 255 : 255 - 2 * (255 - rgba1.b) * (255 - rgba2.b) / 255;
    var a = (rgba1.a + rgba2.a) / 2;
    
    
    var Color3 = new JSS.Color({r:r,
    							g:g,
    							b:b,
    							a:a});
    Color3.format = "rgba";
    return Color3;

},


JSS.Difference = function(color1, color2) {
		
	var Color1 = new JSS.Color(color1);
	var Color2 = new JSS.Color(color2);
	
		
	var rgba1 = Color1.toRGBA();
	var rgba2 = Color2.toRGBA();
	
	var r = Math.abs(rgba1.r - rgba2.r);
	var g = Math.abs(rgba1.g - rgba2.g);
	var b = Math.abs(rgba1.b - rgba2.b);
	var a = (rgba1.a + rgba2.a) / 2;
	
	var Color3 = new JSS.Color("rgba("+r+","+g+","+b+","+a+")");
	Color3.color = Color3.toRGBA();
	
	return Color3;
}


JSS.Saturate = function(color, percent){
	
	var Color = new JSS.Color(color);
	var hsla = Color.toHSLA();
	hsla.s += percent;
	Color.color = hsla;
	
	return Color;
}

JSS.Desaturate = function(color, percent){
	
	var Color = new JSS.Color(color);
	var hsla = Color.toHSLA();
	hsla.s -= percent;
	Color.color = hsla;
	
	return Color;
}

JSS.prototype.NumInterval = function(num, min, max){
	return Math.min(max, Math.max(min, num));
}


JSS.prototype.Percent = function(num, perc, min, max){
	return JSS.prototype.NumInterval(num*(1+(perc/100)), min, max);
}

JSS.Color = function(color){
	
	this.color = (color instanceof JSS.Color ? color.build() : color);
	this.format = "";
	this.className = "Color";
	
	this.alpha = function(num){
		if(this.format != "rgba"){
			this.color = this.toRGBA();
		}
		
		this.color.a = parseFloat(num);
		return this;
	}
	
	this.hue = function(num){
		if(this.format != "hsla"){
			this.color = this.toHSLA();
		}
		
		this.color.h = JSS.prototype.NumInterval(num+this.color.h, 0, 360);
		return this;
	}
	
	this.saturation = function(num){
		if(this.format != "hsla"){
			this.color = this.toHSLA();
		}
		
		this.color.s = JSS.prototype.NumInterval(num+this.color.s, 0, 100);
		return this;
	}
	
	this.desaturation = function(num){
		if(this.format != "hsla"){
			this.color = this.toHSLA();
		}
		
		this.color.s = JSS.prototype.NumInterval(this.color.s - num, 0, 100);
		return this;
	}
	
	this.light = function(num){
		if(this.format != "hsla"){
			this.color = this.toHSLA();
		}
		
		this.color.l = JSS.prototype.NumInterval(num+this.color.l, 0, 100);
		return this;
	}
	
	this.dark = function(num){
		if(this.format != "hsla"){
			this.color = this.toHSLA();
		}
		
		this.color.l = JSS.prototype.NumInterval(this.color.l - num, 0, 100);
		return this;
	}
	
	this.red = function(num){
		if(this.format != "rgba"){
			this.color = this.toRGBA();
		}
		
		this.color.r = JSS.prototype.NumInterval(num+this.color.r, 0, 255);
		return this;
	}
	
	this.green = function(num){
		if(this.format != "rgba"){
			this.color = this.toRGBA();
		}
		
		this.color.g = JSS.prototype.NumInterval(num+this.color.g, 0, 255);
		return this;
	}
	
	this.blue = function(num){
		if(this.format != "rgba"){
			this.color = this.toRGBA();
		}
		
		this.color.b = JSS.prototype.NumInterval(num+this.color.b, 0, 255);
		return this;
	}
	
	this.multiply = function(color){
		this.color = JSS.Multiply(this, color).color;
		return this;
	}
	
	this.screen = function(color){
		this.color = JSS.Screen(this, color).color;
		return this;
	}
	
	this.overlay = function(color){
		this.color = JSS.Overlay(this, color).color;
		return this;
	}
	
	this.mix = function(args){
		if(Array.isArray(args)){
			arguments = args;
		}
		this.color = JSS.Mix(this, arguments[0], arguments[1]).color;
		return this;
	}
	
	this.getDistance = function(color){
		return JSS.GetDistanceColor(this.color, color);
	}
	
	this.buildHSLA = function(){
		this.format = "hsla";
		
		MakeIntegerColorValues(this);
		
		this.color.a = (this.color.a >= 0 ? this.color.a : 1);
		return "hsla("+this.color.h+","+this.color.s+"%,"+this.color.l+"%,"+this.color.a+")";
	}
	
	this.buildRGBA = function(){
		this.format = "rgba";
		
		MakeIntegerColorValues(this);
		
		this.color.a = (this.color.a >= 0 ? this.color.a : 1);
		return "rgba("+this.color.r+","+this.color.g+","+this.color.b+","+this.color.a+")";
	}
	
	this.build = function(){
		if(typeof this.color == "object"){
			if(this.color.r != undefined){
				this.color = this.buildRGBA();
			}else{
				this.color = this.buildHSLA();
				this.color = this.toRGBA();
				this.color = this.buildRGBA();
			}
		}else{
			this.color = this.toRGBA();
			this.build();
		}
		
		
		return this.color;
	}
	
	this.toRGBA = function(){
		if(typeof this.color == "object"){
			if(this.color.r == undefined){
				this.color = this.build();
				this.format = "rgba";
				
				
				
				return JSS.prototype.ColorConvert(this.color);
			}else{
				this.format = "rgba";
				return this.color;
			}
		}else{
			this.format = "rgba";
			return JSS.prototype.ColorConvert(this.color);
		}
		
	}
		
	this.toHSLA = function(){
		if(typeof this.color == "object" && this.color.r == undefined){
			this.color = this.build();
		}
		
		this.format = "hsla";
		return JSS.prototype.toHsla(this.color);
	}
	
	
	this.toString = function(){
		return this.build();
	}
	
	
	var MakeIntegerColorValues = function(me){
		Object.keys(me.color).forEach(function(e){
			if(e != "a"){
				me.color[e] = +me.color[e];
			}
		});
	}
	
}



JSS.Image = function(uri){
	
	
	var canvas = document.createElement('canvas'),
		context = canvas.getContext('2d'),
		me = this;
		
		
	me.img = new Image();
	me.imgWidth;
	me.imgHeight;
	me.encodedImage;
	me.loaded = false;
	me.pixelsColor = [];
	me.imageData = null;

	

	
	me.img.onload = function(e){
		me.loaded = true;
		me.imgWidth = e.target.width;
		me.imgHeight = e.target.height;
		
		DrawImage(me);
	}
	
	var DrawImage = function(scope){
		canvas.width = scope.imgWidth;
    	canvas.height = scope.imgHeight;
    	
    	context.drawImage( scope.img, 0, 0, canvas.width, canvas.height );
    	ToColors();
	}
	
	var RefactoryImageColor = function(func, params){
		
		var pixels = me.imageData.data;

		for(i = 0; i < me.pixelsColor.length; i++){
			var color = me.pixelsColor[i][func](params),
				loop = i * 4;
				
			
			
			if(color.color.r == undefined){
				color = color.toRGBA();
			}else{
				color = color.color;
			}
			
			pixels[loop+0] = color.r;
			pixels[loop+1] = color.g;
			pixels[loop+2] = color.b;
			pixels[loop+3] = color.a;
				
		}
		
	}
	
	
	var ToColors = function(){
		var imageData = context.getImageData( 0, 0, canvas.width, canvas.height ),
            pixels    = imageData.data;
            
        for( i = 0, len = pixels.length; i < len; i += 4 ) {
            var color = {
        			r:pixels[i],
        			g:pixels[i+1],
        			b:pixels[i+2],
        			a:pixels[i+3],
        		};
        		
        	var pixel = new JSS.Color(color);
        	pixel.format = "rgba";
        	
        	//console.log(pixel);
        	//return false;
        	me.pixelsColor.push(pixel);       
        	
        }
        me.imageData = imageData;
	}
	
	
	me.build = function(){
		if(me.imageData != null){
			context.putImageData(me.imageData, 0, 0 );
		}
		
    	me.encodedImage = canvas.toDataURL();
    	
    	return me.encodedImage;
	}
	
	me.toString = function(){
		return me.build();
	}
	
	
	me.alpha = function(num){
		RefactoryImageColor('alpha', num);
		return this;
	}
	
	me.hue = function(num){
		RefactoryImageColor('hue', num);
		return this;
	}
	
	me.saturation = function(num){
		RefactoryImageColor('saturation', num);
		return this;
	}
	
	me.desaturation = function(num){
		RefactoryImageColor('desaturation', num);
		return this;
	}
	
	me.light = function(num){
		RefactoryImageColor('light', num);
		return this;
	}
	
	me.dark = function(num){
		RefactoryImageColor('dark', num);
		return this;
	}
	
	me.red = function(num){
		RefactoryImageColor('red', num);
		return this;
	}
	
	me.green = function(num){
		RefactoryImageColor('green', num);
		return this;
	}
	
	me.blue = function(num){
		RefactoryImageColor('blue', num);
		return this;
	}
	
	me.multiply = function(color){
		RefactoryImageColor('multiply', color);
		return this;
	}
	
	me.screen = function(color){
		RefactoryImageColor('screen', color);
		return this;
	}
	
	me.overlay = function(color){
		RefactoryImageColor('overlay', color);
		return this;
	}
	
	me.mix = function(color, weight){
		RefactoryImageColor('mix', [color, weight]);
		return this;
	}
	
	me.img.src = uri;
	JSS.Images.push(me);
}
