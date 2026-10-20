import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getCategories, deleteCourse } from '../services/api';

export default function CourseDetailScreen({ route, navigation }) {
  // Lấy dữ liệu khóa học truyền từ Màn hình Danh sách sang
  const { course } = route.params;

  const [categoryName, setCategoryName] = useState('Đang tải...');
  const [loading, setLoading] = useState(false);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  // Tải tên danh mục tương ứng với categoryId
  useEffect(() => {
    fetchCategoryName();
  }, []);

  const fetchCategoryName = async () => {
    try {
      const categories = await getCategories();
      const found = categories.find((cat) => cat.id === course.categoryId);
      if (found) {
        setCategoryName(found.name);
      } else {
        setCategoryName('Chưa phân loại');
      }
    } catch (error) {
      setCategoryName('Chưa phân loại');
    }
  };

  // Xử lý xác nhận và xóa khóa học
  const handleDelete = () => {
    const confirmDelete = window.confirm 
      ? window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}"?`)
      : true;

    if (confirmDelete) {
      executeDelete();
    }
  };

  const executeDelete = async () => {
    try {
      setLoading(true);
      await deleteCourse(course.id);
      alert('Đã xóa khóa học thành công!');
      navigation.goBack();
    } catch (error) {
      alert('Xóa khóa học thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang xử lý...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nút Quay lại */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅ Quay lại danh sách</Text>
        </TouchableOpacity>

        {/* Khối hiển thị Trailer / Ảnh bìa */}
        {isPlayingTrailer ? (
          <View style={styles.videoContainer}>
            <Video
              style={styles.videoPlayer}
              source={{
                uri: course.trailerUrl || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
              }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              shouldPlay
            />
            <TouchableOpacity
              style={styles.closeVideoButton}
              onPress={() => setIsPlayingTrailer(false)}
            >
              <Text style={styles.closeVideoText}>✖ Ẩn Video Trailer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: course.thumbnail }}
              style={styles.thumbnail}
              defaultSource={{ uri: 'https://via.placeholder.com/300' }}
            />
            <TouchableOpacity
              style={styles.playTrailerButton}
              onPress={() => setIsPlayingTrailer(true)}
            >
              <Text style={styles.playTrailerText}>▶ Xem Trailer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Thông tin chi tiết */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{course.title}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>📂 {categoryName}</Text>
            </View>
            <Text style={styles.price}>
              {Number(course.price).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>👨‍🏫 Giảng viên:</Text>
            <Text style={styles.detailValue}>{course.instructor}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>⏱️ Thời lượng:</Text>
            <Text style={styles.detailValue}>{course.duration} giờ</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Ngày tạo:</Text>
            <Text style={styles.detailValue}>{course.createdAt || 'N/A'}</Text>
          </View>

          <Text style={styles.sectionTitle}>📝 Mô tả khóa học:</Text>
          <Text style={styles.description}>
            {course.description || 'Chưa có mô tả chi tiết cho khóa học này.'}
          </Text>

          {/* Nhóm nút bấm hành động */}
          <View style={styles.actionButtonsRow}>
            {/* Nút Sửa: Đã được truyền dữ liệu course sang CourseForm */}
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => navigation.navigate('CourseForm', { course: course })}
            >
              <Text style={styles.actionButtonText}>✏️ Sửa khóa học</Text>
            </TouchableOpacity>

            {/* Nút Xóa */}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.actionButtonText}>🗑️ Xóa khóa học</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6c757d' },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  thumbnailContainer: { position: 'relative', marginBottom: 16 },
  thumbnail: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#e9ecef' },
  playTrailerButton: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0, 0, 0, 0.75)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  playTrailerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  videoContainer: { marginBottom: 16, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden' },
  videoPlayer: { width: '100%', height: 220 },
  closeVideoButton: { backgroundColor: '#333', padding: 10, alignItems: 'center' },
  closeVideoText: { color: '#fff', fontWeight: 'bold' },
  infoContainer: { marginTop: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#212529', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryBadge: { backgroundColor: '#e7f5ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  categoryBadgeText: { color: '#1c7ed6', fontWeight: '600', fontSize: 14 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#d90429' },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { width: 110, fontSize: 15, color: '#495057', fontWeight: '500' },
  detailValue: { flex: 1, fontSize: 15, color: '#212529', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#343a40', marginTop: 16, marginBottom: 8 },
  description: { fontSize: 15, color: '#495057', lineHeight: 22, marginBottom: 24 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionButton: { flex: 0.48, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  editButton: { backgroundColor: '#ffec99' },
  deleteButton: { backgroundColor: '#ffe3e3' },
  actionButtonText: { fontWeight: 'bold', fontSize: 15, color: '#343a40' },
});