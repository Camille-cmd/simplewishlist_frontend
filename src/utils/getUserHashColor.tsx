abstract class CRC8{

    private static CRC8_DATA = '005EBCE2613FDD83C29C7E20A3FD1F419DC3217FFCA2401E5F01E3BD3E6082DC237D9FC1421CFEA0E1BF5D0380DE3C62BEE0025CDF81633D7C22C09E1D43A1FF4618FAA427799BC584DA3866E5BB5907DB856739BAE406581947A5FB7826C49A653BD987045AB8E6A7F91B45C6987A24F8A6441A99C7257B3A6486D85B05E7B98CD2306EEDB3510F4E10F2AC2F7193CD114FADF3702ECC92D38D6F31B2EC0E50AFF1134DCE90722C6D33D18F0C52B0EE326C8ED0530DEFB1F0AE4C1291CF2D73CA947628ABF517490856B4EA6937D58B5709EBB536688AD495CB2977F4AA4816E9B7550B88D6346A2B7597C94A14F6A8742AC896154BA9F7B6E80A54D7896B35';
    private static textEncoder = new TextEncoder();

    private static strToArr(str: string): number[] {
        const arr = str.match(/[0-9a-f]{2}/ig); // convert into array of hex pairs
        return arr!.map(x => parseInt(x, 16)); // convert hex pairs into ints (bytes)
    }

    private static calculateCRC8(bArr: Uint8Array): number {
        const crc8_table = CRC8.strToArr(CRC8.CRC8_DATA);
        let i = 1;
        const i2 = bArr.length - 1;
        let b = 0;
        while (i <= i2) {
            b = crc8_table[(b ^ bArr[i]) & 255];
            i++;
        }
        return b;
}
    public static calc(text: string): number{
        const uint8Array = CRC8.textEncoder.encode(text);
        return CRC8.calculateCRC8(uint8Array)
    }
}



/**
 * Generate a color based on the username.
 * Uses CSS HSL to generate the color.
 *
 * @param {string} username - The input string (username) to hash.
 * @returns {string} The generated HSL color string.
 */
export const usernameToColor = (username: string): string => {
    const crc = CRC8.calc(username);

    const saturationLightnessMatches = [[70, 75], [50, 60], [90, 85]]
    const [saturation, lightness] = saturationLightnessMatches[crc % 3]

    return `hsl(${crc}, ${saturation}%, ${lightness}%)`;
}
