const fs = require('fs');
const path = require('path');

const keepPaths = new Set([
"assets/images/ui-pack/PNG/panel_brown.png",
"assets/images/medals/PNG/flat_medal1.png",
"assets/images/medals/PNG/flat_medal2.png",
"assets/images/medals/PNG/flat_medal3.png",
"assets/images/Barrel32x32.png",
"assets/audio/impact-audio/impactPunch_medium_000.ogg",
"assets/audio/impact-audio/impactWood_light_000.ogg",
"assets/images/platformer/Base pack/Items/bomb.png",
"assets/images/explosion/Sprite_Sheets/Exploding Red Oil Barrel.png",
"assets/images/particle/PNG (Transparent)/smoke_01.png",
"assets/audio/impact-audio/impactMining_000.ogg",
"assets/audio/impact-audio/impactGlass_light_000.ogg",
"assets/images/platformer/Base pack/Items/coinGold.png",
"assets/audio/casino-audio/chips-collide-1.ogg",
"assets/images/Horse Pack/Horse Pack/Horses/1.png",
"assets/images/Horse Pack/Horse Pack/Horses/3.png",
"assets/images/Horse Pack/Horse Pack/Horses/5.png",
"assets/images/Horse Pack/Horse Pack/Horses/8.png",
"assets/audio/rpg-audio/footstep00.ogg",
"assets/audio/impact-audio/impactWood_heavy_000.ogg",
"assets/images/Cows/Cows/cows_spritesheet_black0.png",
"assets/images/Cows/Cows/cows_spritesheet_black1.png",
"assets/images/Cows/Cows/cows_spritesheet_brown.png",
"assets/images/Cows/Cows/cows_spritesheet_white0.png",
"assets/images/Cows/Cows/cows_spritesheet_white1.png",
"assets/images/Cows/Cows/cows_spritesheet_white_darkspots.png",
"assets/images/Cows/Cows/cows_spritesheet_white_pinkspots.png",
"assets/audio/rpg-audio/clothBelt.ogg",
"assets/audio/rpg-audio/cloth1.ogg",
"assets/images/Adventurer/Poses/adventurer_back.png",
"assets/images/Adventurer/Poses/adventurer_stand.png",
"assets/images/Adventurer/Poses/adventurer_cheer1.png",
"assets/images/Adventurer/Poses/adventurer_hurt.png",
"assets/images/rifle.png",
"assets/images/shot_yellow_large.png",
"assets/images/icon_bullet_gold_long.png",
"assets/images/icon_bullet_silver_long.png",
"assets/images/crosshair_white_large.png",
"assets/images/snakes/SnakeAlbino-Walk.png",
"assets/images/snakes/SnakeBlue-Walk.png",
"assets/images/snakes/SnakeBrown-Walk.png",
"assets/images/snakes/SnakeCorn-Walk.png",
"assets/images/snakes/SnakeGreen-Walk.png",
"assets/images/snakes/SnakeRed-Walk.png",
"assets/audio/impact-audio/impactGeneric_light_000.ogg",
"assets/audio/impact-audio/impactSoft_heavy_000.ogg",
"assets/images/ui-pack/PNG/buttonRound_beige.png",
"assets/images/ui-pack/PNG/buttonRound_grey.png",
"assets/audio/digital-audio/tone1.ogg",
"assets/audio/digital-audio/pepSound1.ogg",
"assets/audio/digital-audio/powerUp1.ogg",
"assets/images/ui-pack/PNG/buttonLong_blue.png",
"assets/images/ui-pack/PNG/buttonLong_beige.png",
"assets/images/ui-pack/PNG/buttonLong_brown.png",
"assets/images/ui-pack/Sounds/tap-a.ogg",
"assets/images/ui-pack/Sounds/click-a.ogg"
].map(p => path.resolve(p)));

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const assetsDir = path.resolve('assets');
const allFiles = walk(assetsDir);
let deletedCount = 0;

for (let file of allFiles) {
    if (!keepPaths.has(file)) {
        fs.unlinkSync(file);
        deletedCount++;
    }
}

// Optional: clean up empty directories
function cleanEmptyDirs(dir) {
    let list = fs.readdirSync(dir);
    for (let file of list) {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            cleanEmptyDirs(fullPath);
        }
    }
    list = fs.readdirSync(dir);
    if (list.length === 0) {
        fs.rmdirSync(dir);
    }
}

cleanEmptyDirs(assetsDir);
console.log(`Deleted ${deletedCount} unused asset files.`);
