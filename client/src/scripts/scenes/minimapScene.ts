import Phaser from "phaser";
import {
    GAS_ALPHA, GAS_COLOR, GRASS_COLOR
} from "../utils/constants";

export class MinimapScene extends Phaser.Scene {
    playerIndicator!: Phaser.GameObjects.Image;
    playerIndicatorDead = false;
    isExpanded!: boolean;

    gasRect!: Phaser.GameObjects.Rectangle;
    gasCircle!: Phaser.GameObjects.Arc;
    gasMask!: Phaser.Display.Masks.GeometryMask;
    // gasToCenterLine!: Phaser.GameObjects.Line;

    renderTexture!: Phaser.GameObjects.RenderTexture;

    mapScale = 2;

    constructor() {
        super("minimap");
    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.cameras.main.setBackgroundColor(GRASS_COLOR);
    }

    create(): void {
        this.scene.bringToTop();

        this.playerIndicatorDead = false;

        // Draw the grid
        const GRID_WIDTH = 720 * this.mapScale;
        const GRID_HEIGHT = 720 * this.mapScale;
        const CELL_SIZE = 16 * this.mapScale;

        for (let x = 0; x <= GRID_WIDTH; x += CELL_SIZE) {
            this.add.rectangle(x, 0, this.mapScale, GRID_HEIGHT, 0x000000, 0.35).setOrigin(0, 0);
        }
        for (let y = 0; y <= GRID_HEIGHT; y += CELL_SIZE) {
            this.add.rectangle(0, y, GRID_WIDTH, this.mapScale, 0x000000, 0.35).setOrigin(0, 0);
        }

        this.renderTexture = this.add.renderTexture(0, 0, 720 * this.mapScale, 720 * this.mapScale).setOrigin(0, 0);

        // Create gas rectangle and mask
        this.gasCircle = this.add.circle(360 * this.mapScale, 360 * this.mapScale, 512 * this.mapScale, 0x000000, 0);
        this.gasMask = this.make.graphics().createGeometryMask(this.gasCircle).setInvertAlpha(true);
        this.gasRect = this.add.rectangle(360 * this.mapScale, 360 * this.mapScale, 1000 * this.mapScale, 1000 * this.mapScale, GAS_COLOR, GAS_ALPHA).setDepth(10).setMask(this.gasMask);
        // this.gasToCenterLine = this.add.line(3600, 3600).setStrokeStyle(4, 0xffff00);

        $(window).on("resize", () => {
            if (this.isExpanded) this.resizeBigMap();
        });

        this.playerIndicator = this.add.image(360, 360, "main", "player_indicator.svg").setDepth(10).setScale(0.1 * this.mapScale);
        this.switchToSmallMap();
    }

    toggle(): void {
        if (this.isExpanded) this.switchToSmallMap();
        else this.switchToBigMap();
    }

    resizeBigMap(): void {
        if (this.sys === undefined) return;
        const screenWidth: number = this.sys.game.canvas.width;
        const screenHeight: number = this.sys.game.canvas.height;
        this.cameras.main.setZoom(0.0012 / this.mapScale * screenHeight);
        // noinspection JSSuspiciousNameCombination
        this.cameras.main.setSize(screenHeight, screenHeight);
        this.cameras.main.setPosition(screenWidth / 2 - screenHeight / 2, 0);
        this.cameras.main.centerOn(360 * this.mapScale, 380 * this.mapScale);
    }

    switchToBigMap(): void {
        this.isExpanded = true;
        this.cameras.main.stopFollow();
        this.resizeBigMap();
        $("#minimap-border").hide();
    }

    switchToSmallMap(): void {
        this.isExpanded = false;
        this.cameras.main.setSize(250, 250);
        this.cameras.main.setPosition(20, 20);
        this.cameras.main.setZoom(1 / this.mapScale);
        this.cameras.main.startFollow(this.playerIndicator);
        $("#minimap-border").show();
    }
}