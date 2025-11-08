import { Button } from '@mantine/core';

const ReadTab = ({ manga }) => {
  const searchMangaDex = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) {
      return;
    }
    const encodedTitle = encodeURIComponent(title);
    const url = `https://mangadex.org/Search?q=${encodedTitle}`;
    window.open(url, '_blank');
  };

  const searchShonenJump = () => {
    const title = manga?.title?.english;
    if (!title) {
      return;
    }
    const encodedTitle = encodeURIComponent(title);
    const url = `https://viz.com/search?search=${encodedTitle}`;
    window.open(url, '_blank');
  };

  // const searchMangaPlus = () => {
  //   const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
  //   if(!title) {
  //     console.log('No title found for manga:', manga);
  //     return;
  //   }
  //   const encodedTitle = encodeURIComponent(`${title} manga plus shueisha`);

  //   const url = `https://www.google.com/search?q=${encodedTitle}`;
  //   window.open(url, '_blank');
  // };

  const searchMangaPlus = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) {
      console.log('No title found for manga:', manga);
      return;
    }
    const encodedTitle = encodeURIComponent(title);
    const url = `https://mangaplus.shueisha.co.jp/search_result?keyword=${encodedTitle}`;
    window.open(url, '_blank');
  };

  const searchAzuki = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) {
      console.log('No title found for manga:', manga);
      return;
    }

    const encodedTitle = encodeURIComponent(title);
    const url = `https://www.azuki.co/discover?q=${encodedTitle}`;

    window.open(url, '_blank');
  };

  const searchYenPress = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) {
      return;
    }
    const encodedTitle = encodeURIComponent(title);
    const url = `https://www.yenpress.com/search?q=${encodedTitle}`;
    window.open(url, '_blank');
  };

  const searchMangaKatana = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) {
      return;
    }
    const encodedTitle = encodeURIComponent(title);
    const url = `https://mangakatana.com/?search=${encodedTitle}`;
    window.open(url, '_blank');
  };

  const searchMangaFire = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) return;

    const encodedTitle = encodeURIComponent(title);

    const url = `https://www.google.com/search?q=${encodedTitle}+site:mangafire.to`;
    window.open(url, '_blank');
  };

  const searchMangaReader = () => {
    const title = manga?.title?.english || manga?.title?.romaji || manga?.title?.native;
    if (!title) return;
    const encodedTitle = encodeURIComponent(title);
    const url = `https://www.mangareader.to/search?keyword=${encodedTitle}`;
    window.open(url, '_blank');
  };

  return (
    <div className='p-4'>
      <h2 className='mb-4 text-xl font-bold'>Read Online</h2>
      <div className='space-y-2'>
        <div className='flex flex-wrap gap-2'>
          <Button onClick={searchMangaDex} variant='outline' size='sm' color='violet'>
            MangaDex (Search)
          </Button>
          <Button onClick={searchShonenJump} variant='outline' size='sm' color='violet'>
            Shonen Jump
          </Button>
          <Button onClick={searchMangaPlus} variant='outline' size='sm' color='violet'>
            Manga Plus
          </Button>
          <Button onClick={searchAzuki} variant='outline' size='sm' color='violet'>
            Azuki
          </Button>
          <Button onClick={searchYenPress} variant='outline' size='sm' color='violet'>
            Yen Press
          </Button>
          <Button onClick={searchMangaKatana} variant='outline' size='sm' color='violet'>
            Manga Katana
          </Button>
          <Button onClick={searchMangaFire} variant='outline' size='sm' color='violet'>
            Manga Fire
          </Button>
          <Button onClick={searchMangaReader} variant='outline' size='sm' color='violet'>
            Manga Reader
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReadTab;
