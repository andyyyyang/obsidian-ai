"use client";
import * as React from "react";
import { Button, type ButtonProps } from "./button";

/**
 * 表單送出鈕 — 吸收所有「pending state + Loader2 spinner + 停用按鈕」的重複
 * 使用：
 *   <SubmitButton pending={pending} icon={<Save />} loadingText="儲存中…">儲存</SubmitButton>
 *
 * 預設 type="submit"；若為非 form 的 async 按鈕可傳 type="button"。
 */

export interface SubmitButtonProps extends Omit<ButtonProps, "loading"> {
  pending: boolean;
}

export function SubmitButton({ pending, loadingText, type = "submit", ...props }: SubmitButtonProps) {
  return (
    <Button
      type={type}
      loading={pending}
      loadingText={loadingText ?? "處理中…"}
      {...props}
    />
  );
}
