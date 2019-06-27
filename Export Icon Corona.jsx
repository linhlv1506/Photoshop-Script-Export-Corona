/*!
 * Android Assets for Photoshop
 * =============================
 *
 * Version: 1.0.0
 * Author: Gaston Figueroa (Uncorked Studios)
 * Site: uncorkedstudios.com
 * Licensed under the MIT license
 */


// Photoshop variables
var docRef = app.activeDocument,
	activeLayer = docRef.activeLayer,
	activeLayer2,
	docName = docRef.name,
	docPath = docRef.path,	
	resolutionsObj = {
		"Icon-ldpi" : {
			size : 36
		},

		"Icon-mdpi" : {
			size : 48
		},
		
		"Icon-hdpi" : {
			size : 72
		},

		"Icon-xhdpi" : {
			size : 96
		},

		"Icon-xxhdpi" : {
			size : 144
		},
		
		"Icon-xxxhdpi" : {
			size : 192
		},
		
		"Icon" : {
			size : 57
		},
		
		"Icon@2x" : {
			size : 114
		},
		
		"Icon@3x" : {
			size : 171
		},

		"Icon-16" : {
			size : 16
		},
		
		"Icon-24" : {
			size : 24
		},
		
		"Icon-32" : {
			size : 32
		},
		
		"Icon-40" : {
			size : 40
		},
		
		"Icon-40@2x" : {
			size : 80
		},
		
		"Icon-40@3x" : {
			size : 120
		},
		
		"Icon-57" : {
			size : 57
		},
		
		"Icon-58" : {
			size : 58
		},
		
		"Icon-60" : {
			size : 60
		},
		
		"Icon-60@2x" : {
			size : 120
		},
		
		"Icon-60@3x" : {
			size : 180
		},
		
		"Icon-64" : {
			size : 64
		},
		
		"Icon-72" : {
			size : 72
		},
		
		"Icon-72@2x" : {
			size : 144
		},
		
		"Icon-76" : {
			size : 76
		},
		
		"Icon-76@2x" : {
			size : 152
		},
		
		"Icon-80" : {
			size : 80
		},
		
		"Icon-87" : {
			size : 87
		},
		
		"Icon-120" : {
			size : 120
		},
		
		"Icon-152" : {
			size : 152
		},
		
		"Icon-167" : {
			size : 167
		},
		
		"Icon-180" : {
			size : 180
		},
		
		"Icon-1024" : {
			size : 1024
		},
		
		//"Icon-Amazon" : {
			//size : 114
		//},
		
		"Icon-Small" : {
			size : 29
		},
		
		"Icon-Small@2x" : {
			size : 58
		},
		
		"Icon-Small@3x" : {
			size : 87
		},
		
		"Icon-Small-40" : {
			size : 40
		},
		
		"Icon-Small-40@2x" : {
			size : 80
		},
		
		"Icon-Small-40@3x" : {
			size : 120
		},
		
		"Icon-Small-50" : {
			size : 50
		},
		
		"Icon-Small-50@2x" : {
			size : 100
		},
		
		"iTunesArtwork" : {
			size : 512
		},
		
		"iTunesArtwork@2x" : {
			size : 1024
		},
		
		"IconNotificationDefault-ldpi" : {
			size : 18
		},
		
		"IconNotificationDefault-mdpi" : {
			size : 24
		},
		
		"IconNotificationDefault-hdpi" : {
			size : 36
		},
		
		"IconNotificationDefault-xhdpi" : {
			size : 48
		},
		
		"IconNotificationDefault-xxhdpi" : {
			size : 72
		},
		
		"IconNotificationDefault-xxxhdpi" : {
			size : 96
		},
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
			saveFunc(resolution);
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


function resizeDoc(document, resolution) {
	var calcWidth  = activeLayer.bounds[2] - activeLayer.bounds[0]; // Get layer's width

	var newWidth = Math.floor(resolutionsObj[resolution].size);
	
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

function saveFunc(resolution) {
	dupToNewFile();
	
	var tempDoc = app.activeDocument;
	
	resizeDoc(tempDoc, resolution);

	var tempDocName = resolution; //tempDoc.name.replace(/\.[^\.]+$/, '');
	var docFolder = Folder(docPath + '/' + docName + '-assets');

	if(!docFolder.exists) {
		docFolder.create();
	}

	//alert(docFolder);

	var saveFile = File(docFolder + "/" + tempDocName + ".png");

	var sfwOptions = new ExportOptionsSaveForWeb(); 
	sfwOptions.format = SaveDocumentType.PNG; 
	sfwOptions.includeProfile = false; 
	sfwOptions.interlaced = 0; 
	sfwOptions.optimized = true; 
	sfwOptions.quality = 100;
	sfwOptions.PNG8 = false;

	// Export the layer as a PNG
	activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);

	// Close the document without saving
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}