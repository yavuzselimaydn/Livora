import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get("window")

export const hp = percantage => {
    return (percantage * deviceHeight) / 100;
}

export const wp = percantage => {
    return (percantage * deviceWidth) / 100;
}

export const stripHtmlTags = (html) => {
    return html.replace(/<[^>]*>?/gm, "");
}