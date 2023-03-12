import { AttachmentIcon, CheckIcon } from '@chakra-ui/icons';
import { Button, Flex, HStack, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { UploaderProps } from './index.types';

export const ChakraFileUploaderSkeleton = ({ ...ctx }: UploaderProps) => {
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
        <Flex w='full' justifyContent='space-between'>
          <HStack w='full'>
            <Button
              {...ctx.chooseBtnProps}
              leftIcon={<AttachmentIcon />}
              size='sm'
              disabled
            >
              {ctx.chooseBtnText ?? 'انتخاب'}
            </Button>
            <Button
              {...ctx.uploadBtnProps}
              leftIcon={<CheckIcon />}
              size='sm'
              disabled
            >
              {ctx.uploadBtnText ?? 'ذخیره'}
            </Button>
          </HStack>
        </Flex>
        <Flex w='full' alignItems='center' mt='4'>
          <Skeleton w='24' h='24' rounded='sm' ml='2' />
          <Skeleton h='4' w='48' />
        </Flex>
      </Flex>
    </>
  );
};
