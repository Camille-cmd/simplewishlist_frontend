export const getUserFirstTwoLetters = (name: string) => {
    const nameArray = name.split(" ");
    if (nameArray.length > 1) {
        return nameArray[0].charAt(0).toUpperCase() + nameArray[1].charAt(0).toUpperCase();
    } else {
        return name.charAt(0).toUpperCase() + name.charAt(1).toUpperCase();
    }
}
