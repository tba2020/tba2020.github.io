__(''); // 의미없는 코드 넣어서 첫번째 번역 안되는 현상 패스.
var camera = undefined,
    scene = undefined,
    renderer = undefined,
    light = undefined,
    mouseX = undefined,
    mouseY = undefined,
    maze = undefined,
    mazeMesh = undefined,
    mazeDimension = 11,
    planeMesh = undefined,
    ballMesh = undefined,
    ballRadius = 0.25,
    keyAxis = [0, 0],
    ironTexture = THREE.ImageUtils.loadTexture('ball.png'),
    planeTexture = THREE.ImageUtils.loadTexture('concrete.png'), //concrete.png
    brickTexture = THREE.ImageUtils.loadTexture('brick.png'), //brick.png
	gameState = undefined,
	useGyro = false, // 자이로스코프 센서 사용여부.
	timeStart = 0;
	timeEnd = 0;
	score = [],

    // Box2D shortcuts
    b2World = Box2D.Dynamics.b2World,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2Settings = Box2D.Common.b2Settings,
    b2Vec2 = Box2D.Common.Math.b2Vec2,

    // Box2D world variables
    wWorld = undefined,
    wBall = undefined;

// 마지막 실행한 scroe 로드 마지막 level과 미로크기 설정
_score = JSON.parse(localStorage.getItem('tba_wg00_score'));
if(_score && _score.length>0) {
	score = _score;
	level = _score.length + 1;
	mazeDimension = (level + 4) * 2 + 1; // 1 : 11, 2 : 13, 3 : 15
}


function timer() {
	timeEnd = new Date().getTime();
	t = timeEnd - timeStart ;
	s = Math.floor(t/1000);
	m = Math.floor(s/60) + '';
	m = m.length>1 ? m : '0'+m;
	s = s%60 + '';
	s = s.length>1 ? s : '0'+s;
	d = t%1000 + '';
	d = d.length>2 ? d : (d.length>1 ? '0'+d : '00'+d);
	$('#timer').text(m+':'+s+'.'+d);
}

function genScoreTable() {
	if(score && score.length>0) {
		_score = score.reverse();
		let table = '<table>';
		for(i in _score) {
			table+= '<tr><th>'+__('Level')+' '+(_score.length-i)+'</th><td>'+_score[i]+'</td></tr>';
		}
		table+='</table>';
		$('#score_table').html(table);
	}
}

function createPhysicsWorld() {
    // Create the world object.
    wWorld = new b2World(new b2Vec2(0, 0), true);

    // Create the ball.
    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(1, 1);
    wBall = wWorld.CreateBody(bodyDef);
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.0;
    fixDef.restitution = 0.25;
    fixDef.shape = new b2CircleShape(ballRadius);
    wBall.CreateFixture(fixDef);

    // Create the maze.
    bodyDef.type = b2Body.b2_staticBody;
    fixDef.shape = new b2PolygonShape();
    fixDef.shape.SetAsBox(0.5, 0.5);
    for (var i = 0; i < maze.dimension; i++) {
        for (var j = 0; j < maze.dimension; j++) {
            if (maze[i][j]) {
                bodyDef.position.x = i;
                bodyDef.position.y = j;
                wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
            }
        }
    }
}


function generate_maze_mesh(field) {
    var dummy = new THREE.Geometry();
    for (var i = 0; i < field.dimension; i++) {
        for (var j = 0; j < field.dimension; j++) {
            if (field[i][j]) {
                var geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
                var mesh_ij = new THREE.Mesh(geometry);
                mesh_ij.position.x = i;
                mesh_ij.position.y = j;
                mesh_ij.position.z = 0.5;
                THREE.GeometryUtils.merge(dummy, mesh_ij);
            }
        }
    }
    var material = new THREE.MeshPhongMaterial({ map: brickTexture });
    var mesh = new THREE.Mesh(dummy, material)
    return mesh;
}


function createRenderWorld() {

    // Create the scene object.
    scene = new THREE.Scene();

    // Add the light.
    light = new THREE.PointLight(0xffffff, 1);
    light.position.set(1, 1, 1.3);
    scene.add(light);

    // Add the ball.
    g = new THREE.SphereGeometry(ballRadius, 32, 16);
    m = new THREE.MeshPhongMaterial({ map: ironTexture });
    ballMesh = new THREE.Mesh(g, m);
    ballMesh.position.set(1, 1, ballRadius);
    scene.add(ballMesh);

    // Add the camera.
    var aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
    camera.position.set(1, 1, 5);
    scene.add(camera);

    // Add the maze.
    mazeMesh = generate_maze_mesh(maze);
    scene.add(mazeMesh);

    // Add the ground.
    g = new THREE.PlaneGeometry(mazeDimension * 10, mazeDimension * 10, mazeDimension, mazeDimension);
    planeTexture.wrapS = planeTexture.wrapT = THREE.RepeatWrapping;
    planeTexture.repeat.set(mazeDimension * 5, mazeDimension * 5);
    m = new THREE.MeshPhongMaterial({ map: planeTexture });
    planeMesh = new THREE.Mesh(g, m);
    planeMesh.position.set((mazeDimension - 1) / 2, (mazeDimension - 1) / 2, 0);
    planeMesh.rotation.set(Math.PI / 2, 0, 0);
    scene.add(planeMesh);

}


function updatePhysicsWorld() {

    // Apply "friction".
    var lv = wBall.GetLinearVelocity();
    lv.Multiply(0.95);
    wBall.SetLinearVelocity(lv);

    // Apply user-directed force.
    var f = new b2Vec2(keyAxis[0] * wBall.GetMass() * 0.25, keyAxis[1] * wBall.GetMass() * 0.25);
    wBall.ApplyImpulse(f, wBall.GetPosition());
    keyAxis = [0, 0];

    // Take a time step.
    wWorld.Step(1 / 60, 8, 3);
}


function updateRenderWorld() {

    // Update ball position.
    var stepX = wBall.GetPosition().x - ballMesh.position.x;
    var stepY = wBall.GetPosition().y - ballMesh.position.y;
    ballMesh.position.x += stepX;
    ballMesh.position.y += stepY;

    // Update ball rotation.
    var tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), stepX / ballRadius);
    tempMat.multiplySelf(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    tempMat = new THREE.Matrix4();
    tempMat.makeRotationAxis(new THREE.Vector3(1, 0, 0), -stepY / ballRadius);
    tempMat.multiplySelf(ballMesh.matrix);
    ballMesh.matrix = tempMat;
    ballMesh.rotation.getRotationFromMatrix(ballMesh.matrix);

    // Update camera and light positions.
    camera.position.x += (ballMesh.position.x - camera.position.x) * 0.1;
    camera.position.y += (ballMesh.position.y - camera.position.y) * 0.1;
    camera.position.z += (5 - camera.position.z) * 0.1;
    light.position.x = camera.position.x;
    light.position.y = camera.position.y;
    light.position.z = camera.position.z - 3.7;
}


function gameLoop() {

    switch (gameState) {

        case 'initialize':
            maze = generateSquareMaze(mazeDimension);
            maze[mazeDimension - 1][mazeDimension - 2] = false;
            createPhysicsWorld();
            createRenderWorld();
            camera.position.set(1, 1, 5);
            light.position.set(1, 1, 1.3);
            light.intensity = 0;
            var level = Math.floor((mazeDimension - 1) / 2 - 4);
            $('#level').text(level);
            gameState = 'fade in';
            break;

        case 'fade in':
            light.intensity += 0.1 * (1.0 - light.intensity);
            renderer.render(scene, camera);
            if (Math.abs(light.intensity - 1.0) < 0.05) {
                light.intensity = 1.0;
				gameState = 'play'
				timeStart = new Date().getTime();
				genScoreTable();
            }
            break;

        case 'play':
            updatePhysicsWorld();
            updateRenderWorld();
			renderer.render(scene, camera);
			timer();

            // Check for victory.
            var mazeX = Math.floor(ballMesh.position.x + 0.5);
            var mazeY = Math.floor(ballMesh.position.y + 0.5);
            if (mazeX == mazeDimension && mazeY == mazeDimension - 2) {
				// 스코어 저장
				var level = Math.floor((mazeDimension - 1) / 2 - 4);
				score[(level-1)] = $('#timer').text();
				localStorage.setItem('tba_wg00_score', JSON.stringify(score));
				// 다음판으로 이동
                mazeDimension += 2;
				gameState = 'fade out';
            }
            break;

        case 'fade out':
            updatePhysicsWorld();
            updateRenderWorld();
            light.intensity += 0.1 * (0.0 - light.intensity);
            renderer.render(scene, camera);
            if (Math.abs(light.intensity - 0.0) < 0.1) {
                light.intensity = 0.0;
                renderer.render(scene, camera);
                gameState = 'initialize'
            }
            break;

    }

    requestAnimationFrame(gameLoop);

}


function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}


function onMoveKey(axis) {
    // console.log('axis:',axis,', keyAxis:',keyAxis);
    // left key down : [-1, 0], key up : [0, 0]
    // right key down : [1, 0], key up : [0, 0]
    // up key down : [0, 1], key up : [0, 0]
    // down key down : [0, -1], key up : [0, 0]
    keyAxis = axis.slice(0);
}


jQuery.fn.centerv = function() {
    wh = window.innerHeight;
	h = this.outerHeight();
    this.css("position", "absolute");
    this.css("top", Math.max(0, (wh - h) / 2) + "px");
    return this;
}


jQuery.fn.centerh = function() {
    ww = window.innerWidth;
    w = this.outerWidth();
	console.log(ww, w, this);
    this.css("position", "absolute");
    this.css("left", Math.max(0, (ww - w) / 2) + "px");
    return this;
}


jQuery.fn.center = function() {
    this.centerv();
    this.centerh();
    return this;
}


$(document).ready(function() {

	// 우측 클릭 방지, 선택 방지, 드래그 방지
	$('body').on('contextmenu selectstart dragstart', function(){return false;});
	document.onmousedown=disableclick;
	function disableclick(event){
		if (event.button==2) {
			return false;
		}
	}

    // Prepare the instructions.
    $('#instructions').center();
    $('#score').center();
    $('#instructions,#score').hide();
    KeyboardJS.bind.key('i', function() { $('#instructions').show() },
        function() { $('#instructions').hide() });
    KeyboardJS.bind.key('h', function() { $('#score').show() },
        function() { $('#score').hide() });

    // Create the renderer.
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Bind keyboard and resize events.
    KeyboardJS.bind.axis('left', 'right', 'down', 'up', onMoveKey);
    KeyboardJS.bind.axis('h', 'l', 'j', 'k', onMoveKey);
    $(window).resize(onResize);


    // Set the initial game state.
    gameState = 'initialize';

    // Start the game loop.
	requestAnimationFrame(gameLoop);

	// history
	if(score && score.length>0) {
		score = score.reverse();
		let table = '<table>';
		for(i in score) {
			table+= '<tr><th>'+__('Level')+' '+(score.length-i)+'</th><td>'+score[i]+'</td></tr>';
		}
		table+='</table>';
		$('#score_table').html(table);
	}

    // //가속도계가 기기의 방향의 변화를 감지 했을때
    // if (window.DeviceOrientationEvent) {
    //     //이벤트 리스너 등록
    //     window.addEventListener('deviceorientation', function(event) {
    //         var absolute = event.absolute;
    //         var alpha = event.alpha;
    //         var beta = event.beta; //(-180, 180)
    //         var gamma = event.gamma; //(-90, 90)
    //         var html = "absolute: " + absolute + "<br>alpha: " + alpha + "<br>bata: " + beta + "<br>gamma: " + gamma;
    //         // console.log(html);
    //         // $('#dataContainerOrientation').html(html);
    //         //볼을 움직이자.
    //         // if(beta > 90) {beta = 90};
    //         // if(beta < -90) {beta = -90};
    //         // beta +90;
    //         // gamma +90;
    //         // ball.style.top = (maxX*beta/180 + 100) + "px";
    //         // ball.style.left = (maxY*gamma/180 + 100) + "px";
    //     }, false);
    // }
    // //가속도에 변화가 발생 할때
    if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', function(event) {
			if(!useGyro) {return false;}
            var x = event.accelerationIncludingGravity.x; // x>0 : 왼쪽으로 이동, x<0 : 오른쪽으로 이동
            var y = event.accelerationIncludingGravity.y; // y>0 : 아래로 , y<0 : 위로
            var z = event.accelerationIncludingGravity.z;
            //var r = event.accelerationIncludingGravity.r;
            var html = "x: " + x + "<br>y: " + y + "<br>z: " + z;
            // console.log(html);
            // $('#dataContainerMotion').html(html);
            // 민감도 조절
            const s = 0.5; // 0 < 민감도 <= 1
            // 모바일에서 세로모드일때 x,y 반전 적용하기
            let mobile = navigator.userAgent.indexOf('Mobi') > -1;
            const portrait = window.matchMedia('(orientation: portrait)').matches; // 가로모드면 참, 세로모드면 거짓
            if (mobile && !portrait) {
                t = x;
                x = y * -1; // y는 방향이 좌우 바뀝니다. 쩝.
                y = t;
            }
            // 이동
            onMoveKey([x * -1 * s, y * -1 * s]);
		}, true);
		useGyro = true;
	}
	// 가속도 센서 미지원시 조이스틱 사용
	// Create JoyStick object into the DIV 'joyDiv'
	var joy = new JoyStick('joyDiv', {'width':'200','height':'200','internalFillColor':'#aaa','internalStrokeColor':'#333','externalStrokeColor':'#888'});
	setInterval(function() {
		const x = joy.GetX();
		const y = joy.GetY();
		const w = joy.GetWidth()/2;
		const h = joy.GetHeight()/2;
		const s = 3; // 민감도 : 조이스틱 영역의 크기가 바뀔 수 있어 영역크기로 나눠서 사용함. (최대값:1) 그래서 속도가 느리니 민감도를 1이상으로 잡아 속도를 높여줍니다.
		onMoveKey([x*s/w, y*s/h]);
		// 조이스틱 사용시 gyro 중지
		if(joy.GetDir()=='C') {
			useGyro = true;
		} else {
			useGyro = false;
		}
	}, 50);
})