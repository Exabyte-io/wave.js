declare module "@mat3ra/periodic-table" {
    interface BondData {
        length: {
            value: number;
        };
    }

    export function filterBondsDataByElementsAndOrder(
        bondsData: BondData[],
        element1: string,
        element2: string,
    ): BondData[];

    export function getElementsBondsData(element1: string, element2: string): BondData[];
}
