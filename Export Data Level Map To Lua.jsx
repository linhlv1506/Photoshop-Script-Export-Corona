var docRef = app.activeDocument;
var docLayers = docRef.layers;
app.activeDocument.rulerUnits = Units.PIXELS;
app.preferences.rulerUnits 	= Units.PIXELS;
var width = app.activeDocument.width.as('px');
var height 	= app.activeDocument.height.as('px');
var output = "";
var assetsFolder = "images/";
var ext = ".png";
var filename = docRef.name.substr(0,docRef.name.length-4);
var level = 0;
/////////////////////////////////////////////////////////////////////////////////////////
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
//Ham tach ten va thuoc tinh
function splitNameAndProperties(str, c) {
	if (str) {
		var result = [];
		var c = c || "[";
		var arr_split = str.split(c);
		if (arr_split[0]) {
			result["name"] = arr_split[0].trim();
		}
		if (arr_split[1]) {
			result["properties"] = [];
			var str_properties = arr_split[1].substr(0, arr_split[1].length-1);
			var properties = str_properties.match(/\w+\s*=\s*\{(\w+\s*=\s*["-]?\w*[.]?[\w\W]+["]?[,]?\s*)+}|\w+\s*=\s*\{(["-]?[\w\/]+["]?[,]?\s*)+}|\w+\s*=\s*["-]?\w*[.]?[\w\/]+["]?/g);
			if (properties)
			{	
				for (var i = 0; i < properties.length; i++) {
					var p = properties[i].split("=");
					if (p[0] && p[1]) {
						var value = [];
						for(var j=1; j<p.length; j++){
							value[value.length] = p[j];
						}
						var k = p[0].trim();
						var v = value.join("=").trim();
						result["properties"][k] = v;
					}	
				}
			}	
		}
		return result;
	}
	return null;
}
//Ham them ky tu tab
function stringTab(sl){
	var str = "";
	for (var i = 0; i < sl; i++) {
		str += "\t";	
	};
	return str;
}
//Ham lay thong tin cua layer
function getLayerInfo(layer) {
	var info = [];		
	var infoLayerName = splitNameAndProperties(layer.name);
	info.tex_name = infoLayerName.name;
	info.var_name = info.tex_name;
	if (infoLayerName.properties) {
		info.properties = infoLayerName.properties;		
	}
	//Vi tri x,y cua layer theo goc trai tren
	var tx = getObjectLeft(layer);
	var ty = getObjectTop(layer);
	//Kich thuoc cua layer
	info.res_width = getObjectWidth(layer);
	info.res_height = getObjectHeight(layer);
	//Vi tri x,y cua layer theo tam
	info.pos_x = tx + info.res_width*0.5;
	info.pos_y = ty + info.res_height*0.5;
	
	//Get path image
	if (info.properties && info.properties.type == 'path'){
		docRef.activeLayer = layer; 
		var pathItem = docRef.pathItems[docRef.pathItems.length-1];  
		var points = [];  
		for(var subPathIndex = 0;subPathIndex<pathItem.subPathItems.length;subPathIndex++){  
			for(var pointIndex = 0;pointIndex<pathItem.subPathItems[subPathIndex].pathPoints.length;pointIndex++){  
				var point = pathItem.subPathItems[subPathIndex].pathPoints[pointIndex].anchor;
				var anchorX = parseFloat(point[0]) - info.pos_x;
				var anchorY = parseFloat(point[1]) - info.pos_y;
				anchorX = anchorX.toFixed(3).replace(/\.?0*$/,'');
				anchorY = anchorY.toFixed(3).replace(/\.?0*$/,'');
				points.push(anchorX); 
				points.push(anchorY); 
			}  
		}  
		var path = points.concat();
		delete info.properties.type; 
		info.properties.path = "{"+path+"}";
	}
	
	return info;
}

/* ================================================================= */
function HandleGroup(layerset)
{	
	level += 1;
	var layers = layerset.layers.length
	var infoLayerName = splitNameAndProperties(layerset.name);
	var no_key = false;
	if (infoLayerName.properties) {
		if (infoLayerName.properties["no_key"] == 'true') {
			no_key = true;
			infoLayerName.properties["name"] = "\""+infoLayerName.name.replace(" ", "_")+"\"";
		}
		if (no_key == true || infoLayerName.properties["isPosition"] == 'true') {
			var info = getLayerInfo(layerset);
			infoLayerName.properties["x"] = info.pos_x;
			infoLayerName.properties["y"] = info.pos_y;
		}
	}
	if (no_key == false)
	{
		output += stringTab(level)+infoLayerName.name.replace(" ", "_")+" =\n";
	}
	output += stringTab(level)+"{\n"
	var no_size = false;
	if (infoLayerName.properties) {
		for (key in infoLayerName.properties) {
			if (key != "no_size" && key != "no_key" && key != "isPosition") {
				output += stringTab(level+1)+key+" = "+infoLayerName.properties[key]+",\n";
			}
		}		
		if (infoLayerName.properties["no_size"] == 'true') {
			no_size = true;	
		}
	}
    while(layers--)
    {
    	var layer = layerset.layers[layers];
    	if (layer.typename == "ArtLayer") {
			if (layer.visible == true){
				output += HandleObject(layer, no_size);
			}
    	}else if (layer.typename == "LayerSet") { 
			if (layer.visible == true){
				HandleGroup(layer);
				level -= 1; 
			}	
    	}
    }      
	output += stringTab(level)+"},\n";
}
//Ham tra ve chuoi thong tin cua layer
function HandleObject(layer, no_size)
{	
	return objString(getLayerInfo(layer), no_size);
}
function objString(info, no_size)
{
	var properties = '';
	var no_name = false;
	var isVisible = true;
	if (info.properties) {
		for (key in info.properties) {
			if (key != "no_size" && key != "no_name" && key != "isVisible") {
				properties += stringTab(level+2)+key+" = "+info.properties[key]+",\n";
			}
		}	
		if (info.properties["isVisible"] == 'false') {
			isVisible = false;	
		}
		if (info.properties["no_size"] == 'true') {
			no_size = true;	
		}
		if (info.properties["no_name"] == 'true') {
			no_name = true;	
		}
		if (info.properties["width"] && info.properties["height"]) {
			no_size = true;
		}
	}  
	var str = '';
	if (isVisible == true)
	{
		str = stringTab(level+1)+"{\n";
		if (no_name == false) {	
			str += stringTab(level+2)+"name = \""+info.tex_name+"\",\n";
		}
		str += stringTab(level+2)+"x = "+info.pos_x+",\n";
		str += stringTab(level+2)+"y = "+info.pos_y+",\n";
		if (no_size == false) {		
			str += stringTab(level+2)+"width = "+info.res_width+",\n";
			str += stringTab(level+2)+"height = "+info.res_height+",\n";
		}
		str += properties;
		str += stringTab(level+1)+"},\n";
	}
	return str;
}
//Ham tra ve chuoi header
function headerString() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
	var date = dd+"/"+mm+"/"+yyyy+" "+h+":"+m+":"+s;

	var str = "--Create date "+date+"\n";
	   str += "--"+filename+".lua\n";
	   str += "return {\n";
	   str += "\twidth = "+width+",\n";
	   str += "\theight = "+height+",\n";
	return str;
}
//Ham tra ve chuoi footer
function footerString() {
	return "}\n";
}

/* ================== HELPER FUNCTIONS ============================= */

//get object x
function getObjectLeft(current_artElement) {
	return current_artElement.bounds[0].as("px");
}

//get object y
function getObjectTop(current_artElement) {
	return current_artElement.bounds[1].as("px");
}

//get object width
function getObjectWidth(current_artElement) {
	var elX = current_artElement.bounds[0].as("px");
	return current_artElement.bounds[2].as("px") - elX;
}

//get height of an object
function getObjectHeight(current_artElement) {
	var elY = current_artElement.bounds[1].as("px");
	return current_artElement.bounds[3].as("px") - elY;
}

/* ================== SAVE ============================= */

function saveFile() {
	if ($.os.search(/windows/i) != -1) {
		fileLineFeed = "Windows"
	} else {
		fileLineFeed = "Macintosh"
	}
	dire = docRef.path //current application folder
	fileOut = new File(dire+"/"+filename+".lua")
	fileOut.lineFeed = fileLineFeed
	fileOut.open("w", "TEXT", "????")
	fileOut.write(output)
	fileOut.close()
	alert(filename+".lua file was saved at "+dire);
}

/* ================================================================= */
function main() {
	output += headerString();
	for (var i=0; i<docLayers.length; i++) {
		var layer = docLayers[i];
		if (layer.typename == "LayerSet") {
			if (layer.visible == true){
				HandleGroup(layer);
			}
		}else if (layer.typename == "ArtLayer") {
			if (layer.visible == true){
				var infoLayerName = splitNameAndProperties(layer.name);
				var no_size = false;
				var flag = true;
				if (infoLayerName.properties) {	
					if (infoLayerName.properties["no_size"] == 'true') {
						no_size = true;	
					}
					if (infoLayerName.properties["isVisible"] == 'false') {
						flag = false;
					}
				}	
				if (flag == true)
				{					
					output += stringTab(level+1)+infoLayerName.name.replace(" ", "_")+" =\n";		
					output += HandleObject(layer, no_size);
				}
			}
		}
		level = 0;
	}
	output += footerString();
	saveFile();
}

main();

