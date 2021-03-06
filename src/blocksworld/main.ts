var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;    // current context

var app: BlocksWorldApp;
var audioCtx:AudioContext = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();

var PIXEL_SIZE: number = 2;
var WINDOW_WIDTH: number = 512*PIXEL_SIZE;
var WINDOW_HEIGHT: number = 384*PIXEL_SIZE;

var d:Date = new Date();
var k:KeyboardState;
var game_time:number;
var init_time:number;

var fonts_loaded:boolean = false;

var global_mouse_x:number = 0;
var global_mouse_y:number = 0;

var fontFamily8px:string = "8px MSX68";
var fontFamily16px:string = "16px MSX68";

var MSX_COLOR_BLACK:string = generateRGBColor(0,0,0);
var MSX_COLOR_GREEN:string = generateRGBColor(43,221,81);
var MSX_COLOR_LIGHT_GREEN:string = generateRGBColor(81,255,118);
var MSX_COLOR_DARK_BLUE:string = generateRGBColor(81,81,255);
var MSX_COLOR_BLUE:string = generateRGBColor(118,118,255);
var MSX_COLOR_DARK_RED:string = generateRGBColor(221,81,81);
var MSX_COLOR_LIGHT_BLUE:string = generateRGBColor(81,255,255);
var MSX_COLOR_RED:string = generateRGBColor(255,81,81);
var MSX_COLOR_LIGHT_RED:string = generateRGBColor(255,118,118);

var MSX_COLOR_DARK_GREEN:string = generateRGBColor(43,187,43);

var MSX_COLOR_GREY:string = generateRGBColor(192,192,192);
var MSX_COLOR_WHITE:string = generateRGBColor(255,255,255);

window.onload = () => {
    // get the canvas and set double buffering:
    canvas = <HTMLCanvasElement>document.getElementById('cnvs');
    ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    app = new BlocksWorldApp(WINDOW_WIDTH, WINDOW_HEIGHT);
    k = new KeyboardState(-1);

    document.addEventListener('keydown', keyboardInputDown);
    document.addEventListener('keyup', keyboardInputUp);

    game_time = init_time = d.getTime();

    requestAnimationFrame(gameLoop);
}


function checkIfFontsAreLoaded():boolean {
    // This is a trick, since in JavaScript, there is no way to know if a font is loaded
    // I know how wide these images should be once the fonts are loaded, so, I wait for that!
    var tmp2:HTMLImageElement = getTextTile("TEST16", fontFamily16px, 16, "white");
    var tmp3:HTMLImageElement = getTextTile("TEST8", fontFamily8px, 8, "white");
    if (tmp2.width == 72 && tmp3.width == 30) {
        return true;
    }
    return false;
}


function keyboardInputDown(event: KeyboardEvent) {
	k.keyDown(event);
}


function keyboardInputUp(event: KeyboardEvent) {
	k.keyUp(event);
}


function gameLoop(timestamp: number) {

    if (!fonts_loaded) {
        fonts_loaded = checkIfFontsAreLoaded();
    } else {
        app.cycle(global_mouse_x, global_mouse_y, k);

        k.cycle();
        k.clearEvents();
        app.draw(WINDOW_WIDTH, WINDOW_HEIGHT);
    }
 
    requestAnimationFrame(gameLoop);
}
