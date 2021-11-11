import {useState} from 'react';
import base from '../lib/base';

export interface RouterHook {
  page: string;
  qsp: URLSearchParams;
  redirect: (path: string) => void;
}

export const mockUseRouter = {
  page: '',
  qsp: new URLSearchParams (''),
  redirect: (path:string) => {}
}

export default function useRouter () {
  // router section
  let initialPage = window.location.pathname;
  const [qsp, setQsp] = useState<URLSearchParams> (new URLSearchParams (window.location.search));
  const [page, setPage] = useState<string> (initialPage);
  const redirect = (path:string) => {
    window.history.pushState ({}, 'Litness', `${base}${path}`)
    setPage (path);
  }

  return {page, qsp, redirect};

}