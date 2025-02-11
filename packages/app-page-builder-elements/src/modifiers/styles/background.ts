import { ElementStylesModifier } from "~/types";

const SCALING_MAP = {
    cover: {
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat"
    },
    contain: {
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
    },
    originalSize: {
        backgroundSize: "auto",
        backgroundRepeat: "no-repeat"
    },
    tile: {
        backgroundSize: "auto",
        backgroundRepeat: "repeat"
    },
    tileHorizontally: {
        backgroundSize: "auto",
        backgroundRepeat: "repeat-x"
    },
    tileVertically: {
        backgroundSize: "auto",
        backgroundRepeat: "repeat-y"
    }
};

const DEFAULT_SCALING = {
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
};

const DEFAULT_POSITION = "top left";

const background: ElementStylesModifier = ({ element, theme }) => {
    const { background } = element.data.settings;
    if (!background) {
        return;
    }

    return Object.keys(theme.breakpoints).reduce((returnStyles, breakpointName) => {
        const values = background[breakpointName];
        if (!values) {
            return returnStyles;
        }

        const styles = {
            backgroundColor: values.color
        };

        const { image } = values;
        if (image) {
            Object.assign(styles, SCALING_MAP[image.scaling] || DEFAULT_SCALING, {
                backgroundPosition: image.position || DEFAULT_POSITION
            });

            if (image.file) {
                Object.assign(styles, {
                    backgroundImage: `url(${image.file.src})`
                });
            }
        }

        return { ...returnStyles, [breakpointName]: styles };
    }, {});
};

export const createBackground = () => background;
