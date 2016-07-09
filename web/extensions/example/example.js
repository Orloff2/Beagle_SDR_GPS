// Copyright (c) 2016 John Seamons, ZL/KF6VO

var example_ext_name = 'example';		// NB: must match example.c:example_ext.name

var example_setup = false;
var example_ws;

function example_main()
{
	// only establish communication to server the first time extension is started
	if (!example_setup) {
		example_ws = ext_connect_server(example_recv);
		example_setup = true;
	} else {
		example_controls_setup();
	}
}

var example_cmd_e = { CMD1:0 };

function example_recv(data)
{
	var firstChars = getFirstChars(data, 3);
	
	// process data sent from server/C by ext_send_data_msg()
	if (firstChars == "DAT") {
		var ba = new Uint8Array(data, 4);
		var cmd = ba[0];

		if (cmd == example_cmd_e.CMD1) {
			// do something ...
		} else {
			console.log('example_recv: DATA UNKNOWN cmd='+ cmd +' len='+ (ba.length-1));
		}
		return;
	}
	
	// process command sent from server/C by ext_send_msg() or ext_send_encoded_msg()
	var stringData = arrayBufferToString(data);
	var params = stringData.substring(4).split(" ");

	for (var i=0; i < params.length; i++) {
		var param = params[i].split("=");

		if (1 && param[0] != "keepalive") {
			if (typeof param[1] != "undefined")
				console.log('example_recv: '+ param[0] +'='+ param[1]);
			else
				console.log('example_recv: '+ param[0]);
		}

		switch (param[0]) {

			// this must be included for initialization
			case "ext_init":
				ext_init(example_ext_name, example_ws);
				example_controls_setup();
				break;

			case "example_command_cmd2":
				var arg = parseInt(param[1]);
				console.log('example_recv: cmd2 arg='+ arg);
				// do something ...
				break;

			default:
				console.log('example_recv: UNKNOWN CMD '+ param[0]);
				break;
		}
	}
}

function example_controls_setup()
{
   var data_html =
      '<div id="id-example-data" class="scale" style="width:1024px; height:30px; background-color:white; position:relative; display:none" title="example">' +
      	'example extension HTML in ext-data-container' +
      '</div>';

	var controls_html =
	"<div id='id-example-controls' style='color:white; width:auto; display:block'>"+
      	'example extension HTML in ext-controls-container'+
	"</div>";

	ext_panel_show(controls_html, data_html, null, function() {
		//console.log('### example_controls_setup ext_panel_show HIDE-HOOK');
		example_visible(0);		// hook to be called when controls panel is closed
	});

	example_visible(1);
}

// called to display HTML for configuration parameters in admin interface
function example_config_html()
{
	ext_admin_config(example_ext_name, 'Example',
		w3_divs('id-example w3-text-teal w3-hide', '',
			'<b>Example configuration</b>' +
			'<hr>' +
			admin_input('int1', 'example.int1', 'admin_num_cb') +
			admin_input('int2', 'example.int2', 'admin_num_cb')
		)
	);
}

function example_visible(v)
{
	visible_block('id-example-data', v);
}