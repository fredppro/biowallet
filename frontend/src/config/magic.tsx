import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import { magicApiKey } from './client';

const createMagic = (key: string) => {
  return (
    typeof window !== "undefined" &&
    new Magic(key, {
      extensions: [new OAuthExtension()],
    })
  );
};

export const magic = createMagic(magicApiKey);
