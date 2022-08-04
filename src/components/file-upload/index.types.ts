import { ButtonProps } from '@chakra-ui/react';

export interface UploaderProps {
  onUpload?: (files: File[]) => void;
  onDelete?: ({ source, id }: { source: File; id: number | string }) => void;
  chooseBtnText?: string;
  chooseBtnProps?: ButtonProps;
  uploadBtnText?: string;
  uploadBtnProps?: ButtonProps;
  cancelBtnText?: string;
  uploadUrl?: string;
  deleteUrl?: string;
  acceptedTypes?: { [key: string]: string[] };
  maxSize?: number;
  minSize?: number;
  maxCount?: number;
  requestHeaders: { [key: string]: string };
  defaultFilesPreview?: {
    url: string;
    fileName: string;
    fileSize: number;
    id: number;
  }[];
  name: string;
  removeErrorMessage?: string;
  idExtractorFromUploadResult: (response: any) => number[] | string[];
}
