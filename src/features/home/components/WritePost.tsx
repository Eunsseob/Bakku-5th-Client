import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';

import { useExchangeStore } from '../store/useExchangeStore';
import { useWriteTagsStore } from '../store/useWriteTagsStore';
import ExchangeGoods from './ExchangeGoods';
import ExchangePlace from './ExchangePlace';
import ExchangeTiming from './ExchangeTiming';
import ExchangeWanted from './ExchangeWanted';
import type { MapPoint } from './MapCanvas';

export default function WritePost() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const addPost = useExchangeStore((state) => state.addPost);
  const tags = useWriteTagsStore((state) => state.tags);
  useEffect(() => () => useWriteTagsStore.getState().setTags([]), []);
  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [conditions, setConditions] = useState<string[]>(['미개봉']);
  const [wanted, setWanted] = useState('');
  const [anyItem, setAnyItem] = useState(false);
  const [quantity, setQuantity] = useState('1:1만');
  const [location, setLocation] = useState('');
  const [locationDetail, setLocationDetail] = useState('');
  const [locationPoint, setLocationPoint] = useState<MapPoint>();
  const [onsite, setOnsite] = useState(true);
  const [duration, setDuration] = useState('15분');
  const [description, setDescription] = useState('');
  const minutes = Number(duration.replace(/[^0-9]/g, ''));
  const valid =
    photos.length > 0 &&
    !!title.trim() &&
    !!category &&
    conditions.length > 0 &&
    (anyItem || (!!wanted.trim() && !!quantity)) &&
    !!location &&
    (!onsite || (Number.isInteger(minutes) && minutes > 0 && minutes <= 1440));
  const quit = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/home');
    }
  };
  const submit = () => {
    if (!valid) return;
    const id = addPost({
      isMine: true,
      title: title.trim(),
      category,
      wanted: anyItem ? '상관없음' : wanted.trim(),
      photos,
      tags,
      condition: conditions,
      quantity: anyItem ? '' : quantity,
      location,
      locationDetail,
      locationPoint,
      onsite,
      remaining: onsite ? minutes : 0,
      minutes: 0,
      distance: 0,
      description: description.trim(),
    });
    router.replace({ pathname: '/post/[id]', params: { id: String(id) } });
  };
  if (step === 1 || step === 2) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ExchangeTiming
          step={step}
          minutes={minutes}
          onDurationSelect={(value) => setDuration(`${value}분`)}
          onsite={onsite}
          onSelect={setOnsite}
          onQuit={quit}
          onBack={() => (step === 2 ? setStep(1) : quit())}
          onNext={() => setStep(step === 1 ? 2 : 3)}
        />
      </>
    );
  }
  if (step === 3) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ExchangeGoods
          tags={tags}
          onTagsPress={() => router.push('/write-tags')}
          photos={photos}
          onPhotosChange={setPhotos}
          title={title}
          onTitleChange={setTitle}
          category={category}
          onCategoryChange={setCategory}
          condition={conditions.find((value) => value === '미개봉' || value === '개봉') ?? ''}
          onConditionChange={(value) => setConditions([value])}
          description={description}
          onDescriptionChange={setDescription}
          onQuit={quit}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      </>
    );
  }
  if (step === 4) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ExchangeWanted
          wanted={wanted}
          onWantedChange={setWanted}
          anyItem={anyItem}
          onAnyItemChange={setAnyItem}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onQuit={quit}
          onBack={() => setStep(3)}
          onNext={() => setStep(5)}
        />
      </>
    );
  }
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ExchangePlace
        location={location}
        detail={locationDetail}
        point={locationPoint}
        onLocationChange={(place, detail, point) => {
          setLocation(place);
          setLocationDetail(detail);
          setLocationPoint(point);
        }}
        onDetailChange={setLocationDetail}
        valid={valid}
        onQuit={quit}
        onBack={() => setStep(4)}
        onSubmit={submit}
      />
    </>
  );
}
