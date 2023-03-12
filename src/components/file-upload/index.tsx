import {
  AttachmentIcon,
  CheckCircleIcon,
  CheckIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Center,
  CloseButton,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Progress,
  StackDivider,
  Tag,
  Text,
  useDisclosure,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useCallback } from 'react';
import {
  ErrorCode,
  FileError,
  FileRejection,
  useDropzone,
} from 'react-dropzone';
import {
  defaultFileTypes,
  imagesTypes,
  placeHolders,
  UploaderProps,
} from './index.types';

export const ChakraFileUploader = ({ ...ctx }: UploaderProps) => {
  const initialFocusRef = React.useRef<HTMLButtonElement>(null);
  const [files, setFiles] = React.useState<
    {
      file: { source: File; size: number; id: number | string };
      preview: string;
      hasBeenUploaded: boolean;
    }[]
  >(
    ctx.defaultFilesPreview?.map((q) => ({
      hasBeenUploaded: true,
      preview: imagesTypes.includes(q.url.split('.')[1])
        ? q.url
        : placeHolders(`application/${q.url.split('.')[1]}`),
      file: {
        source: new File([], q.fileName, { type: q.fileName.split('.')[1] }),
        id: q.id,
        size: q.fileSize,
      },
    })) ?? []
  );
  const [uploadError, setUploadError] = React.useState<FileError>();
  const [uploadProgress, updateUploadProgress] = React.useState<number>(0);
  const [activePreview, setActivePreview] = React.useState<string>();
  const {
    isOpen: isAlertVisible,
    onClose: alertOnClose,
    onOpen: alertOnOpen,
  } = useDisclosure({ defaultIsOpen: true });
  const {
    isOpen: isPreviewModalVisible,
    onClose: previewModalOnClose,
    onOpen: previewModalOnOpen,
  } = useDisclosure({ defaultIsOpen: false });

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        alertOnOpen();
      } else {
        setFiles((files) => [
          ...files,
          ...acceptedFiles.map((file) => ({
            file: {
              size: file.size,
              source: file,
              id: Math.floor(Math.random() * 1000000) + 1000000,
            },
            preview:
              file.type.indexOf('image') !== -1
                ? URL.createObjectURL(file)
                : placeHolders(file.type)!,
            hasBeenUploaded: false,
          })),
        ]);
      }
    },
    []
  );
  const onUploadStart = useCallback(() => {
    if (ctx.onUpload) {
      ctx.onUpload(files.map((q) => q.file.source));
      return;
    }
    if (files.some((q) => !q.hasBeenUploaded)) {
      var formData = new FormData();
      files
        .filter((q) => !q.hasBeenUploaded)
        .forEach((q, index) => formData.append(ctx.name, q.file.source));
      axios
        .post(ctx.uploadUrl!, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...ctx.requestHeaders,
          },
          onUploadProgress: (progressEvent) => {
            let percentComplete = progressEvent.loaded / progressEvent.total;
            percentComplete = parseInt(`${percentComplete * 100}`);
            updateUploadProgress(percentComplete);
          },
        })
        .then((response) => {
          let ids: any[];
          if (!!ctx.idExtractorFromUploadResult) {
            ids = ctx.idExtractorFromUploadResult(response.data);
          } else {
            ids = response.data;
          }
          const updatedFiles = [
            ...files
              .filter((q) => !q.hasBeenUploaded)
              .map((q, index) => ({
                ...q,
                hasBeenUploaded: true,
                file: { ...q.file, id: ids[index] },
              })),
          ];
          setFiles(updatedFiles);
          if (!!ctx.onUploadSuccess) {
            ctx.onUploadSuccess(updatedFiles);
          }
        })
        .catch((error) => {
          setUploadError({ code: error.code, message: error.message });
          alertOnOpen();
        });
    }
  }, [files.length]);

  const { fileRejections, getRootProps, getInputProps, isDragActive, open } =
    useDropzone({
      onDrop,
      accept: ctx.acceptedTypes ?? defaultFileTypes,
      maxFiles: ctx.maxCount ?? 1,
      minSize: ctx.minSize ?? 0,
      maxSize: ctx.maxSize ?? 200000,
    });

  return (
    <>
      <Flex
        flexDir='column'
        w={ctx.width ?? 'full'}
        alignItems='center'
        border='1px dotted'
        borderColor='gray.300'
        rounded='lg'
        bg='#f0f5f7'
        p='4'
      >
        <Flex
          w='full'
          justifyContent='space-between'
          rowGap={4}
          flexDir={{ base: 'column', lg: 'row' }}
        >
          <HStack w={{ base: 'full', lg: '50%' }}>
            <Button
              size='sm'
              {...ctx.chooseBtnProps}
              leftIcon={<AttachmentIcon />}
              onClick={open}
              isDisabled={
                (uploadProgress > 0 && uploadProgress < 100) ||
                files.length >= (ctx.maxCount ?? 1)
              }
            >
              {ctx.chooseBtnText ?? 'انتخاب'}
            </Button>
            <Button
              size='sm'
              {...ctx.uploadBtnProps}
              leftIcon={<CheckIcon />}
              onClick={onUploadStart}
              isDisabled={
                files.length === 0 ||
                (uploadProgress > 0 && uploadProgress < 100) ||
                files.every((q) => q.hasBeenUploaded)
              }
            >
              {ctx.uploadBtnText ?? 'ذخیره'}
            </Button>

            {/* <Button
            leftIcon={<DeleteIcon />}
            onClick={() => setFiles([])}
            isDisabled={
              files.length === 0 || (uploadProgress > 0 && uploadProgress < 100)
            }
            colorScheme='purple'
            variant='solid'
            size='sm'
          >
            {ctx.cancelBtnText ?? 'حذف'}
          </Button> */}
          </HStack>
          <Flex
            w={{ base: 'full', lg: '50%' }}
            justifyContent={{ base: 'start', lg: 'end' }}
          >
            <Wrap>
              <WrapItem>
                <HStack>
                  <Tag fontSize='xs' colorScheme='blue'>
                    {Object.keys(ctx.acceptedTypes ?? defaultFileTypes).map(
                      (q) =>
                        (ctx.acceptedTypes ?? defaultFileTypes)[q].join(' ')
                    )}
                  </Tag>
                </HStack>
              </WrapItem>
              {/* <WrapItem>
                <HStack>
                  <Tag fontSize='xs' colorScheme='gray'>
                    {ctx.maxCount ?? 1}
                  </Tag>
                </HStack>
              </WrapItem> */}
              <WrapItem>
                <HStack>
                  <Tag fontSize='xs' colorScheme='blue' dir='ltr'>
                    {(ctx.maxSize ?? 200000) / 1000}kb
                  </Tag>
                </HStack>
              </WrapItem>
            </Wrap>
          </Flex>
        </Flex>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <Box w='full' mt='4' pt='0'>
            <Progress hasStripe value={uploadProgress} />
          </Box>
        )}
        <Divider my='4' />
        {fileRejections.length > 0 && isAlertVisible && (
          <Alert
            status='error'
            flexDir='column'
            alignItems='start'
            variant='left-accent'
          >
            <VStack
              divider={<StackDivider borderColor='gray.200' />}
              spacing={4}
              align='stretch'
              w='full'
            >
              {fileRejections.map((q) => (
                <Box>
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize='sm'>{q.file.name}</AlertTitle>
                    {q.errors.map((error) => (
                      <AlertDescription fontSize='xs'>
                        {(() => {
                          switch (error.code as ErrorCode) {
                            case ErrorCode.FileInvalidType:
                              return 'فرمت فایل انتخابی درست نیست.';
                            case ErrorCode.FileTooLarge:
                              return 'سایز فایل بیشتر از حد مجاز است.';
                            case ErrorCode.FileTooSmall:
                              return 'سایز فایل کمتر از حد مجاز است.';
                            case ErrorCode.TooManyFiles:
                              return 'تعداد فایل ها بیشتر از حد مجاز است.';
                            default:
                              return 'بارگذاری فایل انتخابی ممکن نیست.';
                          }
                        })()}
                      </AlertDescription>
                    ))}
                  </Box>
                </Box>
              ))}
            </VStack>

            <CloseButton
              position='absolute'
              left='1'
              top='1'
              onClick={alertOnClose}
            />
          </Alert>
        )}
        {!!uploadError && isAlertVisible && (
          <Alert status='warning' variant='left-accent'>
            <AlertIcon />
            <Box>
              <AlertTitle fontSize='sm'>اشکال در بارگزاری فایل</AlertTitle>
            </Box>
            <CloseButton
              position='absolute'
              left='1'
              top='1'
              onClick={alertOnClose}
            />
          </Alert>
        )}

        {files?.length > 0 ? (
          <VStack
            divider={<StackDivider borderColor='gray.200' />}
            spacing={4}
            align='stretch'
            w='full'
            mt='4'
          >
            {files.map((savedFile) => (
              <Flex
                key={savedFile.file.source.name}
                justifyContent='space-between'
                alignItems='center'
                flexWrap='wrap'
              >
                <Flex alignItems='center' w='50%'>
                  {savedFile.hasBeenUploaded && (
                    <CheckCircleIcon color='green' ml='2' />
                  )}
                  <Box maxW='80px'>
                    <Image
                      src={savedFile.preview}
                      // onLoad={function () {
                      //   URL.revokeObjectURL(savedFile.preview);
                      // }}
                      onClick={() => setActivePreview(savedFile.preview)}
                      objectFit='cover'
                      cursor='zoom-in'
                      width='full'
                    />
                  </Box>

                  <Text display={{ base: 'none', md: 'inline-block' }} ms='4'>
                    {savedFile.file.source.name}
                  </Text>
                </Flex>
                <Box w='30%'>
                  <Badge h='fit-content' colorScheme='orange'>
                    {(savedFile.file.size / 1000).toFixed(2)}kb
                  </Badge>
                </Box>
                <Box w='20%' textAlign='left'>
                  <Popover
                    isLazy
                    initialFocusRef={initialFocusRef}
                    placement='bottom'
                    closeOnBlur={false}
                  >
                    {({ isOpen, onClose }) => (
                      <>
                        <PopoverTrigger>
                          <IconButton
                            isDisabled={
                              uploadProgress > 0 && uploadProgress < 100
                            }
                            colorScheme='red'
                            variant='solid'
                            aria-label='Search database'
                            size='xs'
                            icon={<CloseIcon />}
                          />
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader textAlign='right' dir='rtl'>
                            حذف مدیا
                          </PopoverHeader>
                          <PopoverBody textAlign='right' fontSize='xs'>
                            {ctx.removeErrorMessage ??
                              'آیا از حذف  اطمینان دارید؟'}
                          </PopoverBody>
                          <PopoverFooter
                            border='0'
                            display='flex'
                            alignItems='center'
                            justifyContent='space-between'
                          >
                            <ButtonGroup size='sm'>
                              <Button onClick={onClose}>انصراف</Button>
                              <Button
                                onClick={() => {
                                  if (!!ctx.onDelete) {
                                    ctx.onDelete(savedFile.file);
                                  }
                                  if (savedFile.hasBeenUploaded) {
                                    axios.delete(
                                      ctx.deleteUrl?.replace(
                                        ':id',
                                        `${savedFile.file.id}`
                                      )!,
                                      {
                                        headers: {
                                          'Content-Type': 'application/json',
                                          ...ctx.requestHeaders,
                                        },
                                      }
                                    );
                                  }
                                  setFiles((files) =>
                                    files.filter(
                                      (q) => q.file.id !== savedFile.file.id
                                    )
                                  );
                                }}
                                ref={initialFocusRef}
                              >
                                حذف
                              </Button>
                            </ButtonGroup>
                          </PopoverFooter>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                </Box>
              </Flex>
            ))}
          </VStack>
        ) : (
          <Box cursor='pointer' w='full'>
            <Box {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <Text fontSize='xs'>رها کنید.</Text>
              ) : (
                <Center p='3' flexDir='column'>
                  <Image
                    boxSize={{ base: '40px', lg: '75px' }}
                    mb='4'
                    src='data:image/png;base64,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'
                  />
                  <Text textAlign='center' fontSize='2xs'>
                    برای انتخاب فایل کلیک کنید یا فایل را در این محل رها کنید.
                  </Text>
                </Center>
              )}
            </Box>
          </Box>
        )}
      </Flex>
      <Modal
        isOpen={!!activePreview}
        onClose={() => {
          previewModalOnClose();
          setActivePreview('');
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader></ModalHeader>
          <ModalBody textAlign='center'>
            <Image src={activePreview} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
