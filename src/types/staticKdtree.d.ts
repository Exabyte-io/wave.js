declare module 'static-kdtree' {
    export default function createKDTree(points: number[][]): {
        rnn(point: number[], radius: number, callback: (index: number) => void): void;
    };
} 