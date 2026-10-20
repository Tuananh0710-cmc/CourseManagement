import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { getCategories, addCourse, updateCourse } from '../services/api';

export default function CourseFormScreen({ route, navigation }) {
  // Lấy dữ liệu khóa học nếu đây là thao tác Sửa (truyền từ CourseDetailScreen)
  const editingCourse = route.params?.course || null;
  const isEditing = !!editingCourse;

  // Khởi tạo các biến trạng thái (State) cho Form nhập liệu
  const [title, setTitle] = useState(editingCourse ? editingCourse.title : '');
  const [description, setDescription] = useState(editingCourse ? editingCourse.description : '');
  const [categoryId, setCategoryId] = useState(editingCourse ? editingCourse.categoryId : '');
  const [instructor, setInstructor] = useState(editingCourse ? editingCourse.instructor : '');
  const [price, setPrice] = useState(editingCourse ? String(editingCourse.price) : '');
  const [duration, setDuration] = useState(editingCourse ? String(editingCourse.duration) : '');
  const [thumbnail, setThumbnail] = useState(editingCourse ? editingCourse.thumbnail : '');
  const [trailerUrl, setTrailerUrl] = useState(editingCourse ? editingCourse.trailerUrl : '');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Tải danh sách danh mục khi màn hình được hiển thị
  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const fetchCategoriesData = async () => {
    try {
      const data = await getCategories();
      if (data && data.length > 0) {
        setCategories(data);
        // Nếu chưa chọn danh mục nào, tự động chọn danh mục đầu tiên trong danh sách
        if (!categoryId) {
          setCategoryId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Lỗi tải danh mục:', error);
      alert('Không thể tải danh mục từ MockAPI! Vui lòng kiểm tra kết nối.');
    }
  };

  // Hàm kiểm tra tính hợp lệ của dữ liệu trước khi lưu
  const validateForm = () => {
    if (!title.trim() || !instructor.trim() || !thumbnail.trim() || !trailerUrl.trim()) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc!');
      return false;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      alert('Học phí phải là số hợp lệ và không được âm!');
      return false;
    }
    const numDuration = Number(duration);
    if (isNaN(numDuration) || numDuration <= 0) {
      alert('Thời lượng phải lớn hơn 0!');
      return false;
    }
    if (!categoryId) {
      alert('Vui lòng chọn danh mục cho khóa học!');
      return false;
    }
    return true;
  };

  // Hàm xử lý Lưu khóa học (Thêm mới hoặc Cập nhật)
  const handleSave = async () => {
    if (!validateForm()) return;

    const courseData = {
      title,
      description,
      categoryId,
      instructor,
      price: Number(price),
      duration: Number(duration),
      thumbnail,
      trailerUrl,
      createdAt: editingCourse ? editingCourse.createdAt : new Date().toISOString().split('T')[0],
    };

    try {
      setLoading(true);
      if (isEditing) {
        // Gọi API Cập nhật (PUT)
        await updateCourse(editingCourse.id, courseData);
        alert('Cập nhật khóa học thành công!');
      } else {
        // Gọi API Thêm mới (POST)
        await addCourse(courseData);
        alert('Thêm khóa học mới thành công!');
      }
      navigation.goBack();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu khóa học. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang xử lý dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Nút Quay lại */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>⬅ Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {isEditing ? '✏️ Sửa thông tin khóa học' : '➕ Thêm khóa học mới'}
        </Text>

        {/* Tên khóa học */}
        <Text style={styles.label}>Tên khóa học (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Lập trình React Native nâng cao"
          value={title}
          onChangeText={setTitle}
        />

        {/* Chọn danh mục khóa học */}
        <Text style={styles.label}>Danh mục khóa học (*)</Text>
        <View style={styles.categoryPickerContainer}>
          {categories.map((cat) => {
            // Lấy tên danh mục linh hoạt (hỗ trợ cả thuộc tính name hoặc title)
            const catName = cat.name || cat.title || `Danh mục ${cat.id}`;
            const isSelected = categoryId === cat.id;

            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryOption,
                  isSelected && styles.categoryOptionSelected,
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    isSelected && styles.categoryOptionTextSelected,
                  ]}
                >
                  {catName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Giảng viên */}
        <Text style={styles.label}>Giảng viên (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Nguyễn Văn A"
          value={instructor}
          onChangeText={setInstructor}
        />

        {/* Học phí */}
        <Text style={styles.label}>Học phí (VNĐ) (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 500000"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {/* Thời lượng */}
        <Text style={styles.label}>Thời lượng (giờ) (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 30"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        {/* URL Ảnh bìa & Xem trước */}
        <Text style={styles.label}>URL Ảnh bìa (Thumbnail) (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.jpg"
          value={thumbnail}
          onChangeText={setThumbnail}
        />
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.previewImage} />
        ) : null}

        {/* URL Video Trailer */}
        <Text style={styles.label}>URL Video Trailer (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/trailer.mp4"
          value={trailerUrl}
          onChangeText={setTrailerUrl}
        />

        {/* Mô tả */}
        <Text style={styles.label}>Mô tả khóa học</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Nhập mô tả chi tiết nội dung khóa học..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Nhóm nút Hủy & Lưu */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnCancelText}>Hủy bỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}>
            <Text style={styles.btnSaveText}>Lưu khóa học</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 16, paddingBottom: 30 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#6c757d' },
  backButton: { marginBottom: 8 },
  backButtonText: { fontSize: 15, color: '#007AFF', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#212529', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#495057', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#212529' },
  textArea: { height: 100, textAlignVertical: 'top' },
  categoryPickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  categoryOption: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#e9ecef', borderRadius: 8, borderWidth: 1, borderColor: '#dee2e6' },
  categoryOptionSelected: { backgroundColor: '#007AFF', borderColor: '#0056b3' },
  categoryOptionText: { color: '#495057', fontSize: 14, fontWeight: '500' },
  categoryOptionTextSelected: { color: '#fff', fontWeight: 'bold' },
  previewImage: { width: '100%', height: 150, borderRadius: 8, marginTop: 8, backgroundColor: '#e9ecef', resizeMode: 'cover' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  btn: { flex: 0.48, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#e9ecef' },
  btnCancelText: { color: '#495057', fontWeight: 'bold', fontSize: 16 },
  btnSave: { backgroundColor: '#007AFF' },
  btnSaveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});