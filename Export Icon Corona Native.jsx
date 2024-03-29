﻿// Photoshop variables
var imgNameNotification = "corona_statusbar_icon_default.png";
var imgNameIcon = "ic_launcher.png";
var imgNameIconForground = "ic_launcher_foreground.png";

var docRef = app.activeDocument,
	activeLayer = docRef.activeLayer,
	activeLayer2,
	docName = docRef.name,
	docPath = docRef.path,	
	resolutionsObj = {
		"mipmap-mdpi" : [
			{
				size : 48,
				filename : imgNameIcon
			},
			{
				size : 108,
				filename : imgNameIconForground
			}
		],
		
		"mipmap-hdpi" : [
			{
				size : 72,
				filename : imgNameIcon
			},
			{
				size : 162,
				filename : imgNameIconForground
			}
		],

		"mipmap-xhdpi" : [
			{
				size : 96,
				filename : imgNameIcon
			},
			{
				size : 216,
				filename : imgNameIconForground
			}
		],

		"mipmap-xxhdpi" : [
			{
				size : 144,
				filename : imgNameIcon
			},
			{
				size : 324,
				filename : imgNameIconForground
			}
		],
		
		"mipmap-xxxhdpi" : [
			{
				size : 192,
				filename : imgNameIcon
			},
			{
				size : 432,
				filename : imgNameIconForground
			}
		],
		
		"drawable-mdpi-v11" : [
			{
				size : 24,
				filename : imgNameNotification
			}
		],
		
		"drawable-hdpi-v11" : [
			{
				size : 36,
				filename : imgNameNotification
			}
		],
		
		"drawable-xhdpi-v11" : [
			{
				size : 48,
				filename : imgNameNotification
			}
		],
		
		"drawable-xxhdpi-v11" : [
			{
				size : 72,
				filename : imgNameNotification
			}
		],
		
		"drawable-xxxhdpi-v11" : [
			{
				size : 96,
				filename : imgNameNotification
			}
		],
		
	};


// Initialize
init();

function init() {
    
    // save current ruler unit settings, so we can restore it
    var ru = app.preferences.rulerUnits;
    
    // set ruler units to pixel to ensure scaling works as expected
    app.preferences.rulerUnits = Units.PIXELS;    
    
	if(!isDocumentNew()) {
		for(resolution in resolutionsObj) {
			for(var i=0; i<resolutionsObj[resolution].length; i++) {
				saveFunc(resolution, resolutionsObj[resolution][i]);
			}
		}
		alert("Create success file save to " + docPath + "/" + docName + "-assets");
	} else {
		alert("Please save your document before running this script.");
	}

    // restore old ruler unit settings
    app.preferences.rulerUnits = ru;
}

// Test if the document is new (unsaved)
// http://2.adobe-photoshop-scripting.overzone.net/determine-if-file-has-never-been-saved-in-javascript-t264.html

function isDocumentNew(doc){
	// assumes doc is the activeDocument
	cTID = function(s) { return app.charIDToTypeID(s); }
	var ref = new ActionReference();
	ref.putEnumerated( cTID("Dcmn"),
	cTID("Ordn"),
	cTID("Trgt") ); //activeDoc
	var desc = executeActionGet(ref);
	var rc = true;
		if (desc.hasKey(cTID("FilR"))) { // FileReference
		var path = desc.getPath(cTID("FilR"));
		
		if (path) {
			rc = (path.absoluteURI.length == 0);
		}
	}
	return rc;
};


function resizeDoc(doc, icon) {
	var calcWidth  = activeLayer.bounds[2] - activeLayer.bounds[0]; // Get layer's width

	var newWidth = Math.floor(icon.size);
	
	// Resize temp document using Bicubic Interpolation
	resizeLayer(newWidth);

	// Merge all layers inside the temp document
	activeLayer2.merge();
}


// document.resizeImage doesn't seem to support scalestyles so we're using this workaround from http://ps-scripts.com/bb/viewtopic.php?p=14359
function resizeLayer(newWidth) {
	var idImgS = charIDToTypeID( "ImgS" );
	var desc2 = new ActionDescriptor();
	var idWdth = charIDToTypeID( "Wdth" );
	var idPxl = charIDToTypeID( "#Pxl" );
	desc2.putUnitDouble( idWdth, idPxl, newWidth);
	var idscaleStyles = stringIDToTypeID( "scaleStyles" );
	desc2.putBoolean( idscaleStyles, true );
	var idCnsP = charIDToTypeID( "CnsP" );
	desc2.putBoolean( idCnsP, true );
	var idIntr = charIDToTypeID( "Intr" );
	var idIntp = charIDToTypeID( "Intp" );
	var idBcbc = charIDToTypeID( "Bcbc" );
	desc2.putEnumerated( idIntr, idIntp, idBcbc );
	executeAction( idImgS, desc2, DialogModes.NO );
}

function dupToNewFile() {	
	var fileName = activeLayer.name.replace(/\.[^\.]+$/, ''), 
		calcWidth  = Math.ceil(activeLayer.bounds[2] - activeLayer.bounds[0]),
		calcHeight = Math.ceil(activeLayer.bounds[3] - activeLayer.bounds[1]),
		docResolution = docRef.resolution,
		document = app.documents.add(calcWidth, calcHeight, docResolution, fileName, NewDocumentMode.RGB,
		DocumentFill.TRANSPARENT);

	app.activeDocument = docRef;

	// Duplicated selection to a temp document
	activeLayer.duplicate(document, ElementPlacement.INSIDE);

	// Set focus on temp document
	app.activeDocument = document;

	// Assign a variable to the layer we pasted inside the temp document
	activeLayer2 = document.activeLayer;

	// Center the layer
	activeLayer2.translate(-activeLayer2.bounds[0],-activeLayer2.bounds[1]);
}

function saveFunc(resolution, icon) {
	dupToNewFile();
	
	var tempDoc = app.activeDocument;
	
	resizeDoc(tempDoc, icon);

	var tempDocName = icon.filename; //tempDoc.name.replace(/\.[^\.]+$/, '');
	var docFolder = Folder(docPath + '/' + docName + '-assets/' + resolution);

	if(!docFolder.exists) {
		docFolder.create();
	}

	//alert(docFolder);

	var saveFile = File(docFolder + "/" + tempDocName);

	var sfwOptions = new ExportOptionsSaveForWeb(); 
	sfwOptions.format = SaveDocumentType.PNG; 
	sfwOptions.includeProfile = false; 
	sfwOptions.interlaced = 0; 
	sfwOptions.optimized = true; 
	sfwOptions.quality = 100;
	sfwOptions.PNG8 = false;
	sfwOptions.transparency = false;

	// Export the layer as a PNG
	activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);

	// Close the document without saving
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}