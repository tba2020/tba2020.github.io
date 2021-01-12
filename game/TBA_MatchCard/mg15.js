
    // 게임 상태
    var gameState = '';

    // 열린 카드 src
    var openCardId = '';
    var openCardId2 = '';

    // 난수 생성 함수
    function generateRandom (min, max) {
        var ranNum = Math.floor(Math.random()*(max-min+1)) + min;
		return ranNum;
    }

    const cards = [
		'1.png','1.png', // 마이크
		'2.png','2.png', // 미코
		'3.png','3.png', // 미지
		'4.png','4.png', // 진독
		// '5.png','5.png', //
		'6.png','6.png', // 나양
		'7.png','7.png', // 토빗
		'8.png','8.png', // 피깃
		'9.png','9.png', // 민키
		// '12.png','12.png', // 배배
		'11.png','11.png', // 박씨
		'10.png','10.png' // 오덕
	]; // 카드 목록
    var score = 0; // 점수
    var hint = 0; // 힌트
    var openedCtn = 0; // 맞춘 카드 갯수

    // 카드 배치
    function setTable(){
        var cardTableCode = '<tr>';
		let _card = JSON.parse(JSON.stringify(cards));
		var cnt_card = _card.length;
        for(var i=0;i<cnt_card;i++) {
            if(i>0 && i%(cnt_card/4) == 0){
                cardTableCode += '</tr><tr>';
            }
            var idx = generateRandom(0,cnt_card-1-i);
            var img = _card.splice(idx,1);

            cardTableCode += '<td id="card'+i+'"><img class="front" src="images/'+img+'"><img class="back" src="images/0.png" style="display:none"></td>';
        }
        cardTableCode += '</tr>';
        $('#cardTable').html(cardTableCode);
    }

    // 카드 전체 가리기
    function hiddenCards(){
        $('#cardTable td img.front').hide();
        $('#cardTable td img.back').show();
    }

    // 게임 시작
    function startGame() {
        var sec = 4;

		hint = 1;
		displayHint();
        $('#info').hide(); // 안내 문구 가리기
        scoreInit(); // 점수 초기화
        setTable(); // 카드 배치

        //카운트 다운
        function setText(){
            $('#countDown').text(--sec);
        }

        //카운트 다운
        var intervalID = setInterval(setText, 1000);
        setTimeout(function(){
            clearInterval(intervalID);
            $('#countDown').text('Match the TBA Card!!');
            hiddenCards();
            gameState = '';
        }, sec * 1000);
    }

    function endGame() {
        $('#info').show();
		$('#cardTable').empty();
		saveScore();
    }

    // 카드 선택 시
    $(document).on('click', '#cardTable td', function(){
        if(gameState != '') return; // 게임 카운트 다운중일 때 누른 경우 return
        if(openCardId2 != '') return; // 2개 열려있는데 또 누른 경우 return
        if($(this).hasClass('opened')) return; // 열려있는 카드를 또 누른 경우
        $(this).addClass('opened'); // 열여있다는 것을 구분하기 위한 class 추가

        if(openCardId == '') {
            $(this).find('img.front').show();
            $(this).find('img.back').hide();
            openCardId = this.id;
        }else {
            if(openCardId == openCardId2) return; //같은 카드 누른 경우 return

            $(this).find('img.front').show();
            $(this).find('img.back').hide();

            var openCardSrc = $('#'+openCardId).find('img.front').attr('src');
            var openCardSrc2 = $(this).find('img.front').attr('src');
            openCardId2 = this.id;

            if(openCardSrc == openCardSrc2) { // 일치
                openCardId = '';
                openCardId2 = '';
                scorePlus();
                if(++openedCtn == 12){
                    alert('성공!!\n'+score+'점 입니다!');
                }
            }else { // 불일치
                setTimeout(back, 1000);
                scoreMinus();
            }
        }
        // check game end
        if($('#cardTable td img.back:visible').length<1) {
            endGame();
        }
    });

    // 두개의 카드 다시 뒤집기
    function back() {
        $('#'+openCardId).find('img.front').hide();
        $('#'+openCardId).find('img.back').show();
        $('#'+openCardId2).find('img.front').hide();
        $('#'+openCardId2).find('img.back').show();
        $('#'+openCardId).removeClass('opened');
        $('#'+openCardId2).removeClass('opened');
        openCardId = '';
        openCardId2 = '';
	}

	// 두개의 카드 보여주고 닫기
	function showHint() {
		if(hint<1) return ;
        if(gameState != '') return; // 게임 카운트 다운중일 때 누른 경우 return
        if(openCardId2 != '') return; // 2개 열려있는데 또 누른 경우 return
		gameState = 'hint';
		let n = ['0','1'];
		for(i in n) {
			let t=0, cnt_card = $('img.back:visible').length;
			t = Math.floor(Math.random()*cnt_card);
			n[i] = $('img.back:visible').eq(t).parent().attr('id');
			$('#'+n[i]).find('img.front').show();
			$('#'+n[i]).find('img.back').hide();
		}
		setTimeout(function(){
			$('#'+n[0]+', #'+n[1]).find('img.front').hide();
			$('#'+n[0]+', #'+n[1]).find('img.back').show();
			gameState = '';
		}, 2000);
		displayHint(--hint);
	}

    // 점수 초기화
    function scoreInit(){
        score = 0;
        openedCtn = 0;
        $('#score').text(score);
    }
    // 점수 증가
    function scorePlus(){
        score += 10;
        $('#score').text(score);
    }
    // 점수 감소
    function scoreMinus(){
        score -= 5;
        $('#score').text(score);
	}
	// 힌트 수 보여주기
	function displayHint() {
		$('#hint').text(hint);
	}
	// 최고점수 보여주기
	function displayMaxScore() {
		$('#max_score').text(localStorage.getItem("mg15_score"));
	}
	displayMaxScore();
	// 최고 점수 저장
	function saveScore() {
		let max_score = localStorage.getItem("mg15_score");
		if(score>max_score) {
			localStorage.setItem("mg15_score", score);
		}
		displayMaxScore()
	}

    $(document).on('click', '#startBtn', function(){
		if(gameState == '') {
			startGame();
            gameState = 'alreadyStart'
        }
	}).on('click', '.btn-download', function(){// 다운로드 클릭시 힌트수 증가
		displayHint(++hint);
	}).on('click', '.btn-hint', function(){// 다운로드 클릭시 힌트수 증가
		showHint();
	})
	;


