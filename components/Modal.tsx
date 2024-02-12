"use client";
import { useCallback, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Modal = ({ children }: { children: ReactNode }) => {
  const overlay = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // close modal window from x button
  const onDismiss = useCallback(() => {
    router.push("/");
  }, [router]);

  // close modal window from click outside of modal window
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current && onDismiss) {
        onDismiss();
      }
    },
    [onDismiss, overlay]
  );

  return (
    <div ref={overlay} className="modal" onClick={handleClick}>
      <button
        type="button"
        className="absolute top-4 right-8"
        onClick={onDismiss}
      >
        <Image src="/close.svg" height={17} width={17} alt="close" />
      </button>
      <div ref={wrapper} className="modal_wrapper">
        {children}
      </div>
    </div>
  );
};

export default Modal;
