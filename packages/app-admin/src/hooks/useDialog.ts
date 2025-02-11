import { useUi } from "@webiny/app/hooks/useUi";

const useDialog = () => {
    const ui = useUi();
    return {
        showDialog: (message, options) => {
            ui.setState(ui => {
                return { ...ui, dialog: { message, options } };
            });
        },
        hideDialog: () => {
            ui.setState(ui => {
                return { ...ui, dialog: null };
            });
        }
    };
};

export { useDialog };
