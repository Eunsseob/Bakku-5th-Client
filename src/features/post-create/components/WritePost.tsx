import { uuid } from 'expo';
import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { useExchangeStore } from '@/features/home/store/useExchangeStore';
import { homePostsKey } from '@/features/home/api/homePosts';
import {
  getPostDetail,
  postEditLockedMessage,
  postImageSource,
  type PostDetailResponse,
} from '@/features/home/api/postDetail';
import { queryClient } from '@/shared/api/queryClient';
import { useAuthStore } from '@/shared/api/useAuthStore';
import {
  createPost,
  postCategories,
  postSubmitError,
  updatePost,
  uploadPostImages,
  type CreatePostBody,
  type PostCategoryLabel,
  type UpdatePostBody,
} from '../api/createPost';
import { useWriteTagsStore } from '../store/useWriteTagsStore';
import ExchangeGoods from './ExchangeGoods';
import ExchangePlace from './ExchangePlace';
import ExchangeTiming from './ExchangeTiming';
import ExchangeWanted from './ExchangeWanted';
import type { MapPoint } from '@/features/home/components/MapCanvas';

export default function WritePost({
  originalPost: initialPost,
}: {
  originalPost?: PostDetailResponse;
}) {
  const [originalPost] = useState(initialPost);
  const editing = !!originalPost;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(editing ? 3 : 1);
  const addPost = useExchangeStore((state) => state.addPost);
  const accessToken = useAuthStore((state) => state.accessToken);
  const tags = useWriteTagsStore((state) => (editing ? state.editTags : state.tags));
  useEffect(() => {
    const draft = useWriteTagsStore.getState();
    if (originalPost) {
      draft.setEditTags(originalPost.tags ?? []);
      return () => draft.setEditTags([]);
    }
    return () => draft.setTags([]);
  }, [originalPost]);
  const [existingImages] = useState(
    () => new Map(originalPost?.images.map(({ key, url }) => [key, url])),
  );
  const [photos, setPhotos] = useState(() => [...existingImages.keys()]);
  const [title, setTitle] = useState(originalPost?.title ?? '');
  const [category, setCategory] = useState<PostCategoryLabel | ''>(
    () =>
      (Object.keys(postCategories) as PostCategoryLabel[]).find(
        (label) => postCategories[label] === originalPost?.category,
      ) ?? '',
  );
  const [conditions, setConditions] = useState([originalPost?.opened ? '개봉' : '미개봉']);
  const [wanted, setWanted] = useState(originalPost?.wantedItem ?? '');
  const [anyItem, setAnyItem] = useState(editing && originalPost.wantedItem === null);
  const [quantity, setQuantity] = useState('1:1만');
  const [location, setLocation] = useState(originalPost?.place.name ?? '');
  const [locationDetail, setLocationDetail] = useState(originalPost?.place.memo ?? '');
  const [regionName, setRegionName] = useState(originalPost?.place.regionName ?? '');
  const [locationPoint, setLocationPoint] = useState<MapPoint | undefined>(
    originalPost
      ? { latitude: originalPost.place.lat, longitude: originalPost.place.lng }
      : undefined,
  );
  const [exchangeMode, setExchangeMode] = useState<boolean | null>(null);
  const onsite = exchangeMode === true;
  const totalSteps = !editing && onsite ? 4 : 3;
  const [minutes, setMinutes] = useState(0);
  const [description, setDescription] = useState(originalPost?.description ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const uploadedImages = useRef<{ sessionId: number; photos: string; keys: string[] } | null>(null);
  const publishAttempt = useRef<{ body: string; key: string } | null>(null);
  const postTitle = title.trim();
  const memo = locationDetail.trim();
  const valid =
    photos.length > 0 &&
    postTitle.length >= 2 &&
    postTitle.length <= 40 &&
    !!category &&
    conditions.length > 0 &&
    (anyItem || (!!wanted.trim() && !!quantity)) &&
    !!location.trim() &&
    !!regionName &&
    !!locationPoint &&
    (memo.length === 0 || memo.length >= 2) &&
    (editing ||
      (exchangeMode !== null &&
        (!onsite || (Number.isInteger(minutes) && minutes > 0 && minutes <= 1440))));
  const returnToDetail = (id: number) => {
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/post/[id]', params: { id: String(id) } });
  };
  const quit = () => {
    if (submitting.current) return;
    if (originalPost) {
      returnToDetail(originalPost.id);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/home');
    }
  };
  const submit = async () => {
    if (submitting.current || !valid || !locationPoint || !category) return;
    const { accessToken, sessionId } = useAuthStore.getState();
    if (!accessToken) {
      Alert.alert('로그인이 필요해요', '교환글을 저장하려면 로그인해 주세요.');
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);
    try {
      const newPhotos = photos.filter((photo) => !existingImages.has(photo));
      const photoFingerprint = JSON.stringify(newPhotos);
      if (
        uploadedImages.current?.photos !== photoFingerprint ||
        uploadedImages.current.sessionId !== sessionId
      ) {
        const keys = newPhotos.length ? await uploadPostImages(newPhotos) : [];
        uploadedImages.current = { sessionId, photos: photoFingerprint, keys };
      }
      if (useAuthStore.getState().sessionId !== sessionId)
        throw new Error('로그인을 다시 확인해 주세요.');
      const uploadedKeys = uploadedImages.current.keys;
      let uploadedIndex = 0;
      const fields: UpdatePostBody = {
        imageKeys: photos.map((photo) =>
          existingImages.has(photo) ? photo : uploadedKeys[uploadedIndex++],
        ),
        title: postTitle,
        category: postCategories[category],
        opened: conditions.includes('개봉'),
        tags,
        description: description.trim() || null,
        wantedItem: anyItem ? null : wanted.trim(),
        place: {
          lat: locationPoint.latitude,
          lng: locationPoint.longitude,
          name: location.trim(),
          regionName,
          memo: memo || null,
        },
      };
      if (originalPost) {
        const originalFields = {
          imageKeys: originalPost.images.map(({ key }) => key),
          title: originalPost.title.trim(),
          category: originalPost.category,
          opened: originalPost.opened,
          tags: originalPost.tags ?? [],
          description: originalPost.description?.trim() || null,
          wantedItem: originalPost.wantedItem?.trim() || null,
          place: {
            lat: originalPost.place.lat,
            lng: originalPost.place.lng,
            name: originalPost.place.name.trim(),
            regionName: originalPost.place.regionName,
            memo: originalPost.place.memo?.trim() || null,
          },
        };
        const postId = String(originalPost.id);
        const detailKey = ['post-detail', postId];
        const latest = await getPostDetail(postId);
        if (useAuthStore.getState().sessionId !== sessionId)
          throw new Error('로그인을 다시 확인해 주세요.');
        const showLocked = (current: PostDetailResponse) => {
          queryClient.setQueriesData(
            { queryKey: detailKey, predicate: ({ queryKey }) => queryKey[3] === sessionId },
            current,
          );
          Alert.alert('교환글 수정', postEditLockedMessage, [
            { text: '확인', onPress: () => returnToDetail(originalPost.id) },
          ]);
        };
        if (!latest.isMine) throw new Error('작성자만 게시글을 수정할 수 있어요.');
        if (latest.status !== 'AVAILABLE') {
          showLocked(latest);
          return;
        }
        if (JSON.stringify(fields) === JSON.stringify(originalFields)) {
          returnToDetail(originalPost.id);
          return;
        }
        try {
          await updatePost(originalPost.id, fields);
        } catch (error) {
          const current = await getPostDetail(postId).catch(() => null);
          if (
            current &&
            current.status !== 'AVAILABLE' &&
            useAuthStore.getState().sessionId === sessionId
          ) {
            showLocked(current);
            return;
          }
          throw error;
        }
        if (useAuthStore.getState().sessionId !== sessionId) return;
        await queryClient.invalidateQueries({
          queryKey: detailKey,
          predicate: ({ queryKey }) => queryKey[3] === sessionId,
        });
        void queryClient.invalidateQueries({ queryKey: homePostsKey });
        returnToDetail(originalPost.id);
        return;
      }
      const body: CreatePostBody = { ...fields, nowExchangeMinutes: onsite ? minutes : null };
      const fingerprint = JSON.stringify(body);
      if (publishAttempt.current?.body !== fingerprint) {
        publishAttempt.current = { body: fingerprint, key: uuid.v4() };
      }
      const id = await createPost(body, publishAttempt.current.key);
      void queryClient.invalidateQueries({ queryKey: homePostsKey });
      addPost({
        id,
        isMine: true,
        title: body.title,
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
    } catch (error) {
      Alert.alert(
        editing ? '교환글 수정 실패' : '교환글 작성 실패',
        postSubmitError(error, editing),
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };
  if (step === 1 || step === 2) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ExchangeTiming
          step={step}
          minutes={minutes}
          onDurationSelect={setMinutes}
          onsite={exchangeMode}
          onSelect={setExchangeMode}
          onQuit={quit}
          onBack={() => (step === 2 ? setStep(1) : quit())}
          onNext={() => setStep(step === 1 && onsite ? 2 : 3)}
        />
      </>
    );
  }
  if (step === 3) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ExchangeGoods
          editing={editing}
          progress={{ current: totalSteps - 2, total: totalSteps }}
          tags={tags}
          onTagsPress={() =>
            router.push(editing ? '/post/edit-tags' : '/(main)/(post-create)/write-tags')
          }
          photos={photos}
          getPhotoSource={(photo) => {
            const url = existingImages.get(photo);
            return url && accessToken ? postImageSource(url, accessToken) : photo;
          }}
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
          onBack={() => (editing ? quit() : setStep(onsite ? 2 : 1))}
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
          editing={editing}
          progress={{ current: totalSteps - 1, total: totalSteps }}
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
        editing={editing}
        progress={{ current: totalSteps, total: totalSteps }}
        location={location}
        detail={locationDetail}
        point={locationPoint}
        regionName={regionName}
        onLocationChange={(place, region, point) => {
          setLocation(place);
          setRegionName(region);
          setLocationPoint(point);
        }}
        onDetailChange={setLocationDetail}
        submitting={isSubmitting}
        onQuit={quit}
        onBack={() => {
          if (!submitting.current) setStep(4);
        }}
        onSubmit={submit}
      />
    </>
  );
}
