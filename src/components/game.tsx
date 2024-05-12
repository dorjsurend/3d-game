"use client";
import { useEffect } from "react";
import { GameScene } from "./scenes/game";

export const Testing = () => {

    useEffect(() => {
        const canvas = document.getElementById("renderCanvas");
        if (!canvas) return;
        new GameScene(canvas as HTMLCanvasElement)

        // window.addEventListener('resize', function(){
        //     engine.resize();
        // });
    }, []);


    return (
        <div>
            <canvas id="renderCanvas" className="w-screen h-screen" />
        </div>
    );
};
