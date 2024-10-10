// Function to convert a string to a hash
function stringToHash(string: string) {

    const seed = 2393;
    const seed2 = 1069;
    let hash = 0;

    // Set a maximum safe integer to avoid having too dark colors
    const MAX_SAFE_INTEGER = Math.floor(1000000000000 / seed2);
    for(let i = 0; i < string.length; i++) {
        if(hash > MAX_SAFE_INTEGER) {
            hash = Math.floor(hash / seed2);
        }
        hash = hash * seed + string.charCodeAt(i);
    }
    return hash;
    
}


// Transform a username into a rgb color
export const hashUsernameToColor = (name: string) => {
    const hash = stringToHash(name);
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return `rgb(${r}, ${g}, ${b})`;
}
