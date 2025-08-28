import * as RR from '@rr';
export * from '@rr';
import React, { forwardRef, useState } from 'react';

export const Link = forwardRef<HTMLAnchorElement, RR.LinkProps>(function PressableLink(
    { className = '', onPointerDown, onPointerUp, onPointerLeave, onPointerCancel, ...rest },
    ref
) {
    const [pressed, setPressed] = useState(false);
    return (
        <RR.Link
            ref={ref}
            className={`${className} ${pressed ? 'pressed' : ''}`}
            onPointerDown={(e) => { setPressed(true); onPointerDown?.(e); }}
            onPointerUp={(e) => { setPressed(false); onPointerUp?.(e); }}
            onPointerLeave={(e) => { setPressed(false); onPointerLeave?.(e); }}
            onPointerCancel={(e) => { setPressed(false); onPointerCancel?.(e); }}
            {...rest}
        />
    );
});
