
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
};
(() => {
    const in_array = (val, array) => {
        for (i in array) {
            if (array[i] == val) return true;
        }
        return false;
    }
    const support_lang = ['en', 'es', 'de', 'fr', 'ko', 'zh', 'ja'],
		default_lang = 'en';
	var loaded_data = false,
		lang_data = {},
        lang = navigator.language || navigator.userLanguage,
        cookielang = getCookie('lang');
    lang = lang.substr(0, 2);
    lang = in_array(lang, support_lang) ? lang : default_lang;
    lang = cookielang && cookielang !== lang && in_array(cookielang, support_lang) ? cookielang : lang;
    if (cookielang !== lang) {
        setCookie('lang', lang, 365);
	}
	if (window.lang !== lang) {
		window.lang = lang;
	}

    const get_lang_data = (callback) => {
		let cache_time = Math.ceil(((new Date().getTime())/1000)/(60*60*1));
        let data_file = './i18n/' + lang + '.json?v='+cache_time;
        httpRequest = new XMLHttpRequest();
        if (httpRequest) {
            httpRequest.onreadystatechange = function() {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                    if (httpRequest.status === 200) {
						loaded_data = true;
                        r = JSON.parse(httpRequest.responseText);
						lang_data = r.data;
                    } else {
                        console.error('Could not import translation data.');
					}
					if(callback) {callback();}
                }
            };
            httpRequest.open('GET', data_file);
            httpRequest.send();
        }
	}
	get_lang_data();
	window.__ = (key) => {
		// waiting data load
		let t = (new Date()).getTime();
		while(!loaded_data) {
			if((new Date()).getTime()-t>500) {
				loaded_data = true; // stop long waiting
			}
		}
		return lang_data && lang_data[key] ? lang_data[key] : key;
	};
	window._e = (key) => {
		document.write(__(key));
	};
	window._c = (l, callback) => {
		if(!in_array(l, support_lang)) {l=default_lang;}
		if(l!=lang) {
			lang = l;
			setCookie('lang', l, 365);
			get_lang_data(callback);
		}
	}

})();