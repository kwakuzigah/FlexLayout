import * as React from "react";
import { Fragment } from "react";
import { Actions } from "../model/Actions";
import { TabNode } from "../model/TabNode";
import { TabSetNode } from "../model/TabSetNode";
import { CLASSES } from "../Types";
import { ILayoutCallbacks } from "./Layout";
import { ErrorBoundary } from "./ErrorBoundary";
import { I18nLabel } from "../I18nLabel";
import { BorderNode } from "../model/BorderNode";
import { hideElement } from "./Utils";
// import { Action } from "../model/Action";

/** @internal */
export interface ITabProps {
    layout: ILayoutCallbacks;
    selected: boolean;
    node: TabNode;
    factory: (node: TabNode) => React.ReactNode;
    path: string;
}

/** @internal */
export const Tab = (props: ITabProps) => {
    const { layout, selected, node, factory, path } = props;
    const [renderComponent, setRenderComponent] = React.useState<boolean>(!props.node.isEnableRenderOnDemand() || props.selected);

    React.useLayoutEffect(() => {
        if (!renderComponent && selected) {
            // load on demand
            // console.log("load on demand: " + node.getName());
            setRenderComponent(true);
        }
    });

    // const onMouseDown = () => {
    //     const parent = node.getParent() as TabSetNode;
    //     if (parent.getType() === TabSetNode.TYPE) {
    //         if (!parent.isActive()) {
    //             layout.doAction(Actions.setActiveTabset(parent.getId()));
    //         }
    //     }
    // };

    const onDragStart = (event: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
        layout.dragStart(event, undefined, node, node.isEnableDrag(), undefined, undefined);
    };

    const cm = layout.getClassName;
    const useVisibility = node.getModel().isUseVisibility();

    const parentNode = node.getParent() as TabSetNode | BorderNode;
    const style: Record<string, any> = node._styleWithPosition();
    if (!selected) {
        hideElement(style, useVisibility);
    }

    if (parentNode instanceof TabSetNode) {
        if (node.getModel().getMaximizedTabset() !== undefined && !parentNode.isMaximized()) {
            hideElement(style, useVisibility);
        }
    }

    let child;
    if (renderComponent) {
        child = factory(node);
    }

    let className = cm(CLASSES.FLEXLAYOUT__TAB);
    if (parentNode instanceof BorderNode) {
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER);
        className += " " + cm(CLASSES.FLEXLAYOUT__TAB_BORDER_ + parentNode.getLocation().getName());
    }

    const onCloseMouseDown = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    const onClose = (event: React.MouseEvent<HTMLDivElement>) => {
        layout.doAction(Actions.deleteTab(node.getId()));
    };
    const tabActions = layout.getTabActions();

    // const onExtraActionClick = (key: string) => {
    //     console.log('onExtratActionclick')
    //     layout.doAction(new Action(key, {nodeId: node.getId()}));
    // };

    return (
        <div
            className={className}
            data-layout-path={path}
            // onMouseDown={onMouseDown}
            // onTouchStart={onMouseDown}
            style={style}>
            <div className="tab_actions"
                    style={{ transformOrigin: 'top right', transform: `scale(${1 / layout.getScale()}, ${1 / layout.getScale()})` }}>
                <div
                    className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_DRAG)}
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}>
                    {tabActions.move}
                </div>
                {/* {
                layout.getTabExtraActions().map(tabExtraAction => 
                    <div className="tab-extra-action" key={tabExtraAction.key} 
                        onClick={() => onExtraActionClick(tabExtraAction.key)}
                        onMouseDown={() => onExtraActionClick(tabExtraAction.key)}>
                        {tabExtraAction.content}
                    </div>
                )} */}
                <div
                    className={cm(CLASSES.FLEXLAYOUT__TAB_BUTTON_CLOSE)}
                    onMouseDown={onCloseMouseDown}
                    onClick={onClose}
                    onTouchStart={onCloseMouseDown}>
                    {tabActions.close}
                </div>
            </div>
            <ErrorBoundary message={props.layout.i18nName(I18nLabel.Error_rendering_component)}>
                <Fragment>{child}</Fragment>
            </ErrorBoundary>
        </div>
    );
};


