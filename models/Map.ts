import type { MapPoint, MapRectangle } from '@/services/dto/maps.dto';

export class MapCalculator {
    point0?: MapPoint;
    point1?: MapPoint;
    point2?: MapPoint;
    kx?: number;
    ky?: number;

    points: MapPoint[] = [];

    chahgeBasis(p1: MapPoint, p2: MapPoint) {
        this.point1 = p1;
        this.point2 = p2;

        let dlat = p2.lat - p1.lat;
        let dlng = p1.lng - p2.lng;

        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;

        this.kx = dlat / dx;
        this.ky = dlng / dy;

        this.point0 = {
            x: 0,
            y: 0,
            lat: p2.lat - p2.x * this.kx,
            lng: p2.lng + p2.y * this.ky,
        }
    }

    calc(x: number, y: number) {
        return <MapPoint>{
            x,
            y,
            lat: this.point0!.lat + x * this.kx!,
            lng: this.point0!.lng - y * this.ky!,
        };
    }

    multiBasis(ps: MapPoint[]) {
        this.points.length = 0;
        this.points = ps;
        this.points.sort((a, b) => a.x - b.x);
    }

    multiCalc(x: number, y: number): { point: MapPoint, rectangle: MapRectangle } {
        const length = this.points.length;
        let sq: number = Infinity;
        let si = 0;
        let sj = 0;

        for (let i = 0; i < length - 1; i++) {
            for (let j = i + 1; j < length; j++) {
                let p1 = this.points[i];
                let p2 = this.points[j];
                let result = 0;
                if (p1.y < p2.y) {
                    result = checkInside(p1.x, p1.y, p2.x, p2.y)
                } else {
                    result = checkInside(p1.x, p2.y, p2.x, p1.y)
                }
                if (result && result < sq) {
                    sq = result;
                    si = i;
                    sj = j;
                }
            }
        }

        let p1 = this.points[si];
        let p2 = this.points[sj];

        let dlat = p2.lat - p1.lat;
        let dlng = p1.lng - p2.lng;

        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;

        let kx = dlat / dx;
        let ky = dlng / dy;

        let mp: MapPoint = {
            x,
            y,
            lat: p1.lat + (x - p1.x) * kx,
            lng: p1.lng - (y - p1.y) * ky,
        };

        const rectangle: MapRectangle = {
            x: p1.x,
            y: p1.y < p2.y ? p1.y : p2.y,
            w: p2.x - p1.x,
            h: Math.abs(p2.y - p1.y),
        }

        return { point: mp, rectangle: rectangle };


        function checkInside(x1: number, y1: number, x2: number, y2: number) {
            if (x > x1 && x <= x2 && y > y1 && y <= y2) {
                return (x2 - x1) * (y2 - y1);
            } else {
                return 0;
            }
        }

    }
}

