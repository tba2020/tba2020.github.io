(function() {

    /**
     * 사용법 : 
     * 1. 암호화 - Encrypt("암호화할 문자열", "key값", "암호화비트(128, 192, 256중 하나)") 
     * 2. 복호화 - Decrypt("암호화된 문자열", "key값", "암호화비트")
     */

    var Aes = {};

    Aes.cipher = function(input, w) {
        var Nb = 4;
        var Nr = w.length / Nb - 1;

        var state = [
            [],
            [],
            [],
            []
        ];
        for (var i = 0; i < 4 * Nb; i++) {
            state[i % 4][Math.floor(i / 4)] = input[i];
        }

        state = Aes.addRoundKey(state, w, 0, Nb);

        for (var round = 1; round < Nr; round++) {
            state = Aes.subBytes(state, Nb);
            state = Aes.shiftRows(state, Nb);
            state = Aes.mixColumns(state, Nb);
            state = Aes.addRoundKey(state, w, round, Nb);
        }

        state = Aes.subBytes(state, Nb);
        state = Aes.shiftRows(state, Nb);
        state = Aes.addRoundKey(state, w, Nr, Nb);

        var output = new Array(4 * Nb);
        for (var i = 0; i < 4 * Nb; i++) {
            output[i] = state[i % 4][Math.floor(i / 4)];
        }
        return output;
    }

    Aes.keyExpansion = function(key) {
        var Nb = 4;
        var Nk = key.length / 4;
        var Nr = Nk + 6;

        var w = new Array(Nb * (Nr + 1));
        var temp = new Array(4);

        for (var i = 0; i < Nk; i++) {
            var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r;
        }

        for (var i = Nk; i < (Nb * (Nr + 1)); i++) {
            w[i] = new Array(4);
            for (var t = 0; t < 4; t++) {
                temp[t] = w[i - 1][t];
            }
            if (i % Nk == 0) {
                temp = Aes.subWord(Aes.rotWord(temp));
                for (var t = 0; t < 4; t++) {
                    temp[t] ^= Aes.rCon[i / Nk][t];
                }
            } else if (Nk > 6 && i % Nk == 4) {
                temp = Aes.subWord(temp);
            }
            for (var t = 0; t < 4; t++) {
                w[i][t] = w[i - Nk][t] ^ temp[t];
            }
        }
        return w;
    }

    Aes.subBytes = function(s, Nb) {
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < Nb; c++) {
                s[r][c] = Aes.sBox[s[r][c]];
            }
        }
        return s;
    }

    Aes.shiftRows = function(s, Nb) {
        var t = new Array(4);
        for (var r = 1; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                t[c] = s[r][(c + r) % Nb];
            }
            for (var c = 0; c < 4; c++) {
                s[r][c] = t[c];
            }
        }
        return s;
    }

    Aes.mixColumns = function(s, Nb) {
        for (var c = 0; c < 4; c++) {
            var a = new Array(4);
            var b = new Array(4);
            for (var i = 0; i < 4; i++) {
                a[i] = s[i][c];
                b[i] = s[i][c] & 0x80 ? s[i][c] << 1 ^ 0x011b : s[i][c] << 1;
            }

            s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
            s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
            s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
            s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
        }
        return s;
    }

    Aes.addRoundKey = function(state, w, rnd, Nb) {
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < Nb; c++) {
                state[r][c] ^= w[rnd * 4 + c][r];
            }
        }
        return state;
    }

    Aes.subWord = function(w) {
        for (var i = 0; i < 4; i++) {
            w[i] = Aes.sBox[w[i]];
        }
        return w;
    }

    Aes.rotWord = function(w) {
        var tmp = w[0];
        for (var i = 0; i < 3; i++) {
            w[i] = w[i + 1];
        }
        w[3] = tmp;
        return w;
    }

    Aes.sBox = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    ];

    Aes.rCon = [
        [0x00, 0x00, 0x00, 0x00],
        [0x01, 0x00, 0x00, 0x00],
        [0x02, 0x00, 0x00, 0x00],
        [0x04, 0x00, 0x00, 0x00],
        [0x08, 0x00, 0x00, 0x00],
        [0x10, 0x00, 0x00, 0x00],
        [0x20, 0x00, 0x00, 0x00],
        [0x40, 0x00, 0x00, 0x00],
        [0x80, 0x00, 0x00, 0x00],
        [0x1b, 0x00, 0x00, 0x00],
        [0x36, 0x00, 0x00, 0x00]
    ];

    Aes.Ctr = {};

    Aes.Ctr.encrypt = function(plaintext, password, nBits) {
        var blockSize = 16;
        if (!(nBits == 128 || nBits == 192 || nBits == 256)) {
            return '';
        }
        plaintext = Utf8.encode(plaintext);
        password = Utf8.encode(password);

        var nBytes = nBits / 8;
        var pwBytes = new Array(nBytes);
        for (var i = 0; i < nBytes; i++) {
            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
        }
        var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes - 16));

        var counterBlock = new Array(blockSize);
        var nonce = (new Date()).getTime();
        var nonceSec = Math.floor(nonce / 1000);
        var nonceMs = nonce % 1000;

        for (var i = 0; i < 4; i++) {
            counterBlock[i] = (nonceSec >>> i * 8) & 0xff;
        }
        for (var i = 0; i < 4; i++) {
            counterBlock[i + 4] = nonceMs & 0xff;
        }

        var ctrTxt = '';
        for (var i = 0; i < 8; i++) {
            ctrTxt += String.fromCharCode(counterBlock[i]);
        }

        var keySchedule = Aes.keyExpansion(key);

        var blockCount = Math.ceil(plaintext.length / blockSize);
        var ciphertxt = new Array(blockCount);

        for (var b = 0; b < blockCount; b++) {
            for (var c = 0; c < 4; c++) {
                counterBlock[15 - c] = (b >>> c * 8) & 0xff;
            }
            for (var c = 0; c < 4; c++) {
                counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
            }

            var cipherCntr = Aes.cipher(counterBlock, keySchedule);

            var blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
            var cipherChar = new Array(blockLength);

            for (var i = 0; i < blockLength; i++) {
                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                cipherChar[i] = String.fromCharCode(cipherChar[i]);
            }
            ciphertxt[b] = cipherChar.join('');
        }

        var ciphertext = ctrTxt + ciphertxt.join('');
        ciphertext = Base64.encode(ciphertext);

        return ciphertext;
    }

    Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
        var blockSize = 16;
        if (!(nBits == 128 || nBits == 192 || nBits == 256)) {
            return '';
        }
        ciphertext = Base64.decode(ciphertext);
        password = Utf8.encode(password);

        var nBytes = nBits / 8;
        var pwBytes = new Array(nBytes);
        for (var i = 0; i < nBytes; i++) {
            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
        }
        var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
        key = key.concat(key.slice(0, nBytes - 16));

        var counterBlock = new Array(8);
        ctrTxt = ciphertext.slice(0, 8);
        for (var i = 0; i < 8; i++) {
            counterBlock[i] = ctrTxt.charCodeAt(i);
        }

        var keySchedule = Aes.keyExpansion(key);

        var nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
        var ct = new Array(nBlocks);
        for (var b = 0; b < nBlocks; b++) {
            ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
        }
        ciphertext = ct;

        var plaintxt = new Array(ciphertext.length);

        for (var b = 0; b < nBlocks; b++) {
            for (var c = 0; c < 4; c++) {
                counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
            }
            for (var c = 0; c < 4; c++) {
                counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;
            }

            var cipherCntr = Aes.cipher(counterBlock, keySchedule);

            var plaintxtByte = new Array(ciphertext[b].length);
            for (var i = 0; i < ciphertext[b].length; i++) {
                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
            }
            plaintxt[b] = plaintxtByte.join('');
        }

        var plaintext = plaintxt.join('');
        plaintext = Utf8.decode(plaintext);

        return plaintext;
    }

    var Base64 = {};

    Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    Base64.encode = function(str, utf8encode) {
        utf8encode = (typeof utf8encode == 'undefined') ? false : utf8encode;
        var o1, o2, o3, bits, h1, h2, h3, h4, e = [],
            pad = '',
            c, plain, coded;
        var b64 = Base64.code;

        plain = utf8encode ? str.encodeUTF8() : str;

        c = plain.length % 3;
        if (c > 0) {
            while (c++ < 3) {
                pad += '=';
                plain += '\0';
            }
        }


        for (c = 0; c < plain.length; c += 3) {
            o1 = plain.charCodeAt(c);
            o2 = plain.charCodeAt(c + 1);
            o3 = plain.charCodeAt(c + 2);

            bits = o1 << 16 | o2 << 8 | o3;

            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;

            e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        }
        coded = e.join('');

        coded = coded.slice(0, coded.length - pad.length) + pad;

        return coded;
    }

    Base64.decode = function(str, utf8decode) {
        utf8decode = (typeof utf8decode == 'undefined') ? false : utf8decode;
        var o1, o2, o3, h1, h2, h3, h4, bits, d = [],
            plain, coded;
        var b64 = Base64.code;

        coded = utf8decode ? str.decodeUTF8() : str;


        for (var c = 0; c < coded.length; c += 4) {
            h1 = b64.indexOf(coded.charAt(c));
            h2 = b64.indexOf(coded.charAt(c + 1));
            h3 = b64.indexOf(coded.charAt(c + 2));
            h4 = b64.indexOf(coded.charAt(c + 3));

            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

            o1 = bits >>> 16 & 0xff;
            o2 = bits >>> 8 & 0xff;
            o3 = bits & 0xff;

            d[c / 4] = String.fromCharCode(o1, o2, o3);

            if (h4 == 0x40) {
                d[c / 4] = String.fromCharCode(o1, o2);
            }
            if (h3 == 0x40) {
                d[c / 4] = String.fromCharCode(o1);
            }
        }
        plain = d.join('');

        return utf8decode ? plain.decodeUTF8() : plain;
    }


    var Utf8 = {};

    Utf8.encode = function(strUni) {
        if(strUni.replace) {
            var strUtf = strUni.replace(
                /[\u0080-\u07ff]/g,
                function(c) {
                    var cc = c.charCodeAt(0);
                    return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
                }
            );
            strUtf = strUtf.replace(
                /[\u0800-\uffff]/g,
                function(c) {
                    var cc = c.charCodeAt(0);
                    return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
                }
            );
            return strUtf;
        }
    }


    Utf8.decode = function(strUtf) {
        if(strUtf.replace) {
            var strUni = strUtf.replace(
                /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,
                function(c) {
                    var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
                    return String.fromCharCode(cc);
                }
            );
            strUni = strUni.replace(
                /[\u00c0-\u00df][\u0080-\u00bf]/g,
                function(c) {
                    var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
                    return String.fromCharCode(cc);
                }
            );
            return strUni;
        }
    }


    window.Encrypt = function(str, key, nBits) {
        return Aes.Ctr.encrypt(str+'', key+'', nBits+''); // 256
    }

    window.Decrypt = function(str, key, nBits) {
        return Aes.Ctr.decrypt(str+'', key+'', nBits+''); // 256
    }

})();

/*
 * Crypto-JS v2.5.3
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2012 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 * example
 * var digestBytes = Crypto.SHA1("Message", { asBytes: true }); // buyte 리턴
 * var digestString = Crypto.SHA1("Message", { asString: true }); // 문자열 리턴
 */
(typeof Crypto=="undefined"||!Crypto.util)&&function(){var d=window.Crypto={},m=d.util={rotl:function(a,c){return a<<c|a>>>32-c},rotr:function(a,c){return a<<32-c|a>>>c},endian:function(a){if(a.constructor==Number)return m.rotl(a,8)&16711935|m.rotl(a,24)&4278255360;for(var c=0;c<a.length;c++)a[c]=m.endian(a[c]);return a},randomBytes:function(a){for(var c=[];a>0;a--)c.push(Math.floor(Math.random()*256));return c},bytesToWords:function(a){for(var c=[],b=0,i=0;b<a.length;b++,i+=8)c[i>>>5]|=(a[b]&255)<<
	24-i%32;return c},wordsToBytes:function(a){for(var c=[],b=0;b<a.length*32;b+=8)c.push(a[b>>>5]>>>24-b%32&255);return c},bytesToHex:function(a){for(var c=[],b=0;b<a.length;b++)c.push((a[b]>>>4).toString(16)),c.push((a[b]&15).toString(16));return c.join("")},hexToBytes:function(a){for(var c=[],b=0;b<a.length;b+=2)c.push(parseInt(a.substr(b,2),16));return c},bytesToBase64:function(a){if(typeof btoa=="function")return btoa(f.bytesToString(a));for(var c=[],b=0;b<a.length;b+=3)for(var i=a[b]<<16|a[b+1]<<
	8|a[b+2],l=0;l<4;l++)b*8+l*6<=a.length*8?c.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i>>>6*(3-l)&63)):c.push("=");return c.join("")},base64ToBytes:function(a){if(typeof atob=="function")return f.stringToBytes(atob(a));for(var a=a.replace(/[^A-Z0-9+\/]/ig,""),c=[],b=0,i=0;b<a.length;i=++b%4)i!=0&&c.push(("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(b-1))&Math.pow(2,-2*i+8)-1)<<i*2|"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(a.charAt(b))>>>
	6-i*2);return c}},d=d.charenc={};d.UTF8={stringToBytes:function(a){return f.stringToBytes(unescape(encodeURIComponent(a)))},bytesToString:function(a){return decodeURIComponent(escape(f.bytesToString(a)))}};var f=d.Binary={stringToBytes:function(a){for(var c=[],b=0;b<a.length;b++)c.push(a.charCodeAt(b)&255);return c},bytesToString:function(a){for(var c=[],b=0;b<a.length;b++)c.push(String.fromCharCode(a[b]));return c.join("")}}}();
	(function(){var d=Crypto,m=d.util,f=d.charenc,a=f.UTF8,c=f.Binary,b=d.SHA1=function(a,l){var g=m.wordsToBytes(b._sha1(a));return l&&l.asBytes?g:l&&l.asString?c.bytesToString(g):m.bytesToHex(g)};b._sha1=function(b){b.constructor==String&&(b=a.stringToBytes(b));var c=m.bytesToWords(b),g=b.length*8,b=[],d=1732584193,h=-271733879,j=-1732584194,k=271733878,f=-1009589776;c[g>>5]|=128<<24-g%32;c[(g+64>>>9<<4)+15]=g;for(g=0;g<c.length;g+=16){for(var o=d,p=h,q=j,r=k,s=f,e=0;e<80;e++){if(e<16)b[e]=c[g+e];else{var n=
	b[e-3]^b[e-8]^b[e-14]^b[e-16];b[e]=n<<1|n>>>31}n=(d<<5|d>>>27)+f+(b[e]>>>0)+(e<20?(h&j|~h&k)+1518500249:e<40?(h^j^k)+1859775393:e<60?(h&j|h&k|j&k)-1894007588:(h^j^k)-899497514);f=k;k=j;j=h<<30|h>>>2;h=d;d=n}d+=o;h+=p;j+=q;k+=r;f+=s}return[d,h,j,k,f]};b._blocksize=16;b._digestsize=20})();
	window.sha1 = function(str){return Crypto.SHA1(str, { asString: true });}