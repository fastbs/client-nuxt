export type RendererCreateDto = {
    minScale: number,
    maxScale: number,
    element: HTMLElement,
    scaleSensitivity?: number,
}

const hasPositionChanged = <T>(pos: T, prevPos: T) => pos !== prevPos;

const valueInRange = (minScale: number, maxScale: number, scale: number) => scale <= maxScale && scale >= minScale;

const getTranslate = (minScale: number, maxScale: number, scale: number) => (pos: number, prevPos: number, translate: number) =>
    valueInRange(minScale, maxScale, scale) && hasPositionChanged(pos, prevPos)
        ? translate + (pos - prevPos * scale) * (1 - 1 / scale)
        : translate;

const getScale = (scale: number, minScale: number, maxScale: number, scaleSensitivity: number, deltaScale: number) => {
    let newScale = scale + (deltaScale / (scaleSensitivity / scale));
    newScale = Math.max(minScale, Math.min(newScale, maxScale));
    return [scale, newScale];
};

const getMatrix = (scale: number, translateX: number, translateY: number) => `matrix(${scale}, 0, 0, ${scale}, ${translateX}, ${translateY})`;


export class Renderer {
    element: HTMLElement;
    minScale: number;
    maxScale: number;
    scaleSensitivity: number;
    transformation: {
        originX: number,
        originY: number,
        translateX: number,
        translateY: number,
        scale: number
    };

    constructor(rc: RendererCreateDto) {
        const { minScale, maxScale, element, scaleSensitivity = 10 } = rc;
        this.minScale = minScale;
        this.maxScale = maxScale;
        this.element = element;
        this.scaleSensitivity = scaleSensitivity;
        this.transformation = {
            originX: 0,
            originY: 0,
            translateX: 0,
            translateY: 0,
            scale: 1
        };
    }

    private pan(originX: number, originY: number) {
        this.transformation.translateX += originX;
        this.transformation.translateY += originY;
/*         if (this.transformation.translateX < 0)
            this.transformation.translateX = 0;
        if (this.transformation.translateY < 0)
            this.transformation.translateY = 0; */

        this.element.style.transform =
            getMatrix(this.transformation.scale, this.transformation.translateX, this.transformation.translateY);
    }

    panBy(originX: number, originY: number) {
        this.pan(originX, originY);
    }
    
    panScale(originX: number, originY: number, scale: number) {
        this.transformation.scale = scale;
        this.transformation.translateX = originX;
        this.transformation.translateY = originY;        
        
        this.element.style.transform =
            getMatrix(scale, originX, originY);        
    }

    panTo(originX: number, originY: number, scale: number) {
        this.transformation.scale = scale;
        this.pan(originX - this.transformation.translateX, originY - this.transformation.translateY);
    }

    zoom(x: number, y: number, deltaScale: number) {
        x=0;
        y=0;
        const { left, top } = this.element.getBoundingClientRect();
        const [scale, newScale] = getScale(this.transformation.scale, this.minScale, this.maxScale, this.scaleSensitivity, deltaScale);
        const originX = x - left;
        const originY = y - top;
        const newOriginX = originX / scale;
        const newOriginY = originY / scale;
        const translate = getTranslate(this.minScale, this.maxScale, scale);
        const translateX = translate(originX, this.transformation.originX, this.transformation.translateX);
        const translateY = translate(originY, this.transformation.originY, this.transformation.translateY);

        this.element.style.transformOrigin = `${newOriginX}px ${newOriginY}px`;
        this.element.style.transform = getMatrix(newScale, translateX, translateY);
        this.transformation = {
            originX: newOriginX,
            originY: newOriginY,
            translateX,
            translateY,
            scale: newScale
        };
        console.log("this.transformation:", this.transformation);
    }

}
