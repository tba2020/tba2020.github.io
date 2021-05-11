
String.prototype.trim = function() {
	var str = this;
	return this.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
}

String.prototype.toNumber = Number.prototype.toNumber = function() {
	var num = this.toString();
	num = num.replace(/[^0-9.]/g, '');
	return (num=='') ? 0 : num*1;
	num = /^[0-9]+\.[0-9]+$/.test(num) ? parseFloat(num) : parseInt(num);
	if(isNaN(num)) num = 0;
	return num;
}

String.prototype.format = function(args1, args2, args3, args4, args5) {
	var arguments = new Array();
	if(args1) arguments[0] = args1;
	if(args2) arguments[1] = args2;
	if(args3) arguments[2] = args3;
	if(args4) arguments[3] = args4;
	if(args5) arguments[4] = args5;

    var formatted = this;
    for (var arg in arguments) {
        formatted = formatted.replace("{" + arg + "}", arguments[arg]);
    }
    return formatted;
}
if(! Object.assign) {
	Object.prototype.assign = function(o1, o2) {
		jQuery.extend(o1, o2); // for un-support assign
	}
}

function setCookie(name, value, expiredays){
	var todayDate = new Date();
	todayDate.setDate( todayDate.getDate() + expiredays );
	document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

function getCookie( name ){
	var nameOfCookie = name + "=";
	var x = 0;
	while(x <= document.cookie.length) {
		var y = (x+nameOfCookie.length);
		if(document.cookie.substring( x, y ) == nameOfCookie ){
		if((endOfCookie=document.cookie.indexOf( ";", y )) == -1)
			endOfCookie = document.cookie.length;
			var r = unescape( document.cookie.substring( y, endOfCookie ) );
			return (r=="undefined") ? '' : r;
		}
		x = document.cookie.indexOf( " ", x ) + 1;
		if(x == 0) break;
	}
	return "";
}

/**
 * get url parameter value
 * @param String sParam Parameter Name
 */
function getURLParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
	let v = '';
	sParam = (sParam+'').trim();
	if(!sParam) return v;
	sParam += '=';
    for (var i=0; i < sURLVariables.length; i++){
		let param = sURLVariables[i];
		let p = param.indexOf(sParam);
		if(p>-1) {
			v = param.substr(p + sParam.length);
			break;
		}
	}
	return v;
}
/**
 * url parameter�� 媛믪쓣 �ㅼ젙
 * @param {string} sParam �뚮씪硫뷀꽣 �대쫫. ��: page
 * @param {string} sValue �뚮씪硫뷀꽣 媛�. ��: 1
 * @param {string} sUrl URL臾몄옄�� �먮뒗 Query String($_SERVER['QUERY_STRING']) . ��: http://loc.stube.co.kr/message.php
 * @returns {string} 媛믪씠 異붽�/蹂�寃쎈맂 $url. ��: http://loc.stube.co.kr/message.php?&page=1
 */
function setURLParameter(sParam, sValue, sUrl) {
    let sPageURL = sUrl||window.location.search;
	let length = sPageURL.indexOf('?')>-1 ? sPageURL.substring(sPageURL.indexOf('?')+1).length : sPageURL.length;
	let split_url = sPageURL.split('?',2);
	if(sPageURL.indexOf(sParam+'=')>-1) {
		sPageURL = sPageURL.replace(new RegExp(sParam+'=(.[^&]*)?(&|)', 'g'), sParam+'='+sValue+'$2', sPageURL)
	} else {
		if(split_url[1]) {
			sPageURL = sPageURL+'&'+sParam+'='+sValue;
		} else {
			sPageURL = split_url[0]+'?'+sParam+'='+sValue;
		}
	}
	return sPageURL;
}
function setUrlParamValue(sParam, sValue, sUrl) {
	setURLParameter(sParam, sValue, sUrl)
}

function real_number_format(n, d){
	if(typeof n==typeof undefined || n=='' || is_null(n) || is_nan(n) ){n='0';}
	var sign = n<0 ? '-':'';
	if(d) { n = number_format(n, d); }
	n = n+'';
	n = n.replace(/[^0-9.]/g,'');
	var r = n.split('.');
	r[0] = r[0].length==1 ? r[0] : r[0].replace(/^0+/g,'');// �レ옄�� 0 �쒓굅
	if(1000 <= n) { r[0] = number_format(r[0]); }// 肄ㅻ쭏異붽�
	r[1] = r[1] ? r[1].replace(/0{1,}$/g, '') : '';
	if(r[1] && r[1].length>0) {
		r = r.join('.');
	} else {
		r = r[0];
	}
	return sign + r;
}

function remove_array_by_value(array, value) {
    var what, a = arguments, L = a.length, ax;
    while (L && array.length) {
        what = a[--L];
        while ((ax = array.indexOf(what)) !== -1) {
            array.splice(ax, 1);
        }
    }
    return array;
};

function get_keycode(evt) {
	return evt.which?evt.which:window.event.keyCode;
}

function get_str_by_keycode(keycode) {
	let char = '';
	if (window.event.which == null)
		char= String.fromCharCode(event.keyCode);    // old IE
	else
		char= String.fromCharCode(window.event.which);	  // All others
	return char;
}

/**
 * INPUT 媛앹껜�� keydown �대깽�� 諛쒖깮�� �レ옄留� �낅젰�� �� �덈룄濡� �섎뒗 �꾪꽣留곹븿��.
 * �レ옄�� 而ㅼ꽌�대룞�� �꾩슂�� �붿궡��, ��, Del, Backspace �ㅻ벑留� �덉슜�섍퀬 紐⑤몢 �꾪꽣留�.
 * @param {window.event}} evt
 * @example $('#login form input[type=password]').on('keydown', input_filter_number)
 */
function input_filter_number (evt) {
	let keyCode = evt.which?evt.which:event.keyCode,
		val = String.fromCharCode(keyCode);
	if(val.match(/[^0-9]/g) && keyCode!=8 && keyCode!=9 && keyCode!=46 && keyCode!=35 && keyCode!=36 && keyCode!=37 && keyCode!=38 && keyCode!=39 && keyCode!=40 && keyCode!=96 && keyCode!=97 && keyCode!=98 && keyCode!=99 && keyCode!=100 && keyCode!=101 && keyCode!=102 && keyCode!=103 && keyCode!=104 && keyCode!=105 && keyCode!=48 && keyCode!=49 && keyCode!=50 && keyCode!=51 && keyCode!=52 && keyCode!=53 && keyCode!=54 && keyCode!=55 && keyCode!=56 && keyCode!=57) {
		return false;
	}
}

function inIframe () {
	try {
		return window.self !== window.top;
	} catch (e) {
		return true;
	}
}

function inPopup () {
	return window.opener ? true : false;
}

function add_parameter (purl, pname, pvalue) {
	let url = purl.split('?');
	pvalue = pvalue ? urlencode(pvalue) : '';
	params = url[1]; // get 遺�遺�
	url = url[0]; // url 遺�遺�
	let dupl = false; // �대� �덈뒗吏� �щ�
	if(params) {
		params = params.split('&');
		for( i in params) {
			let t = params[i].split('=');
			if(t[0] == pname) {
				dupl = true;
				t[1] = pvalue;
			}
			params[i] = t.join('=');
		}
		if(!dupl) {
			params.push(pname+'='+pvalue);
		}
		params = '?'+params.join('&');
	} else {
		params = '?'+pname+'='+pvalue;
	}
	return url + params;
}

window.alert = function(body, type, title, icon, timeout) {
	VanillaToasts.create({
		title: title || null,
		text: body || null,
		type: type || 'warning',
		icon: icon || '/@resource/images/etc/favicon_64.png',
		timeout: timeout==='0' || timeout===0 ? '' : (timeout || '5500')
	});
}