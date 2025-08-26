// Mock 학교 검색 서비스
// FastAPI 백엔드가 준비되기 전까지 사용

interface School {
  id: string;
  name: string;
  address: string;
  type: '초등학교' | '중학교' | '고등학교' | '대학교';
}

interface SchoolSearchRequest {
  keyword: string;
  limit?: number;
}

interface SchoolSearchResponse {
  schools: School[];
  total: number;
  hasMore: boolean;
}

// Mock 학교 데이터
const mockSchools: School[] = [
  {
    id: '1',
    name: '서울고등학교',
    address: '서울특별시 강남구',
    type: '고등학교',
  },
  {
    id: '2',
    name: '부산고등학교',
    address: '부산광역시 해운대구',
    type: '고등학교',
  },
  {
    id: '3',
    name: '대구고등학교',
    address: '대구광역시 수성구',
    type: '고등학교',
  },
  {
    id: '4',
    name: '인천고등학교',
    address: '인천광역시 남동구',
    type: '고등학교',
  },
  {
    id: '5',
    name: '광주고등학교',
    address: '광주광역시 서구',
    type: '고등학교',
  },
  {
    id: '6',
    name: '대전고등학교',
    address: '대전광역시 유성구',
    type: '고등학교',
  },
  {
    id: '7',
    name: '울산고등학교',
    address: '울산광역시 남구',
    type: '고등학교',
  },
  {
    id: '8',
    name: '세종고등학교',
    address: '세종특별자치시',
    type: '고등학교',
  },
  {
    id: '9',
    name: '수원고등학교',
    address: '경기도 수원시',
    type: '고등학교',
  },
  {
    id: '10',
    name: '성남고등학교',
    address: '경기도 성남시',
    type: '고등학교',
  },
  {
    id: '11',
    name: '의정부고등학교',
    address: '경기도 의정부시',
    type: '고등학교',
  },
  {
    id: '12',
    name: '안양고등학교',
    address: '경기도 안양시',
    type: '고등학교',
  },
  {
    id: '13',
    name: '부천고등학교',
    address: '경기도 부천시',
    type: '고등학교',
  },
  {
    id: '14',
    name: '광명고등학교',
    address: '경기도 광명시',
    type: '고등학교',
  },
  {
    id: '15',
    name: '평택고등학교',
    address: '경기도 평택시',
    type: '고등학교',
  },
  {
    id: '16',
    name: '동두천고등학교',
    address: '경기도 동두천시',
    type: '고등학교',
  },
  {
    id: '17',
    name: '안산고등학교',
    address: '경기도 안산시',
    type: '고등학교',
  },
  {
    id: '18',
    name: '고양고등학교',
    address: '경기도 고양시',
    type: '고등학교',
  },
  {
    id: '19',
    name: '과천고등학교',
    address: '경기도 과천시',
    type: '고등학교',
  },
  {
    id: '20',
    name: '구리고등학교',
    address: '경기도 구리시',
    type: '고등학교',
  },
  {
    id: '21',
    name: '남양주고등학교',
    address: '경기도 남양주시',
    type: '고등학교',
  },
  {
    id: '22',
    name: '오산고등학교',
    address: '경기도 오산시',
    type: '고등학교',
  },
  {
    id: '23',
    name: '시흥고등학교',
    address: '경기도 시흥시',
    type: '고등학교',
  },
  {
    id: '24',
    name: '군포고등학교',
    address: '경기도 군포시',
    type: '고등학교',
  },
  {
    id: '25',
    name: '의왕고등학교',
    address: '경기도 의왕시',
    type: '고등학교',
  },
  {
    id: '26',
    name: '하남고등학교',
    address: '경기도 하남시',
    type: '고등학교',
  },
  {
    id: '27',
    name: '용인고등학교',
    address: '경기도 용인시',
    type: '고등학교',
  },
  {
    id: '28',
    name: '파주고등학교',
    address: '경기도 파주시',
    type: '고등학교',
  },
  {
    id: '29',
    name: '이천고등학교',
    address: '경기도 이천시',
    type: '고등학교',
  },
  {
    id: '30',
    name: '안성고등학교',
    address: '경기도 안성시',
    type: '고등학교',
  },
  {
    id: '31',
    name: '김포고등학교',
    address: '경기도 김포시',
    type: '고등학교',
  },
  {
    id: '32',
    name: '화성고등학교',
    address: '경기도 화성시',
    type: '고등학교',
  },
  {
    id: '33',
    name: '광주고등학교',
    address: '경기도 광주시',
    type: '고등학교',
  },
  {
    id: '34',
    name: '여주고등학교',
    address: '경기도 여주시',
    type: '고등학교',
  },
  {
    id: '35',
    name: '양평고등학교',
    address: '경기도 양평군',
    type: '고등학교',
  },
  {
    id: '36',
    name: '고령고등학교',
    address: '경기도 고령군',
    type: '고등학교',
  },
  {
    id: '37',
    name: '연천고등학교',
    address: '경기도 연천군',
    type: '고등학교',
  },
  {
    id: '38',
    name: '포천고등학교',
    address: '경기도 포천시',
    type: '고등학교',
  },
  {
    id: '39',
    name: '가평고등학교',
    address: '경기도 가평군',
    type: '고등학교',
  },
  {
    id: '40',
    name: '양주고등학교',
    address: '경기도 양주시',
    type: '고등학교',
  },
];

// 학교 검색
export const searchSchools = async (
  request: SchoolSearchRequest
): Promise<SchoolSearchResponse> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 오류 발생
      if (Math.random() < 0.1) {
        reject(new Error('학교 검색 중 오류가 발생했습니다.'));
        return;
      }

      const { keyword, limit = 10 } = request;
      
      // 키워드로 학교 검색 (대소문자 구분 없이)
      const filteredSchools = mockSchools.filter(school =>
        school.name.toLowerCase().includes(keyword.toLowerCase()) ||
        school.address.toLowerCase().includes(keyword.toLowerCase())
      );

      // 결과 제한
      const limitedSchools = filteredSchools.slice(0, limit);
      const hasMore = filteredSchools.length > limit;

      console.log(`[Mock] 학교 검색: "${keyword}" -> ${limitedSchools.length}개 결과`);

      resolve({
        schools: limitedSchools,
        total: filteredSchools.length,
        hasMore,
      });
    }, 300 + Math.random() * 200); // 300-500ms 지연
  });
};

// 학교 상세 정보 조회
export const getSchoolById = async (id: string): Promise<School | null> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // 10% 확률로 오류 발생
      if (Math.random() < 0.1) {
        reject(new Error('학교 정보 조회 중 오류가 발생했습니다.'));
        return;
      }

      const school = mockSchools.find(s => s.id === id);
      
      console.log(`[Mock] 학교 정보 조회: ID ${id} -> ${school ? '성공' : '실패'}`);

      resolve(school || null);
    }, 200 + Math.random() * 100); // 200-300ms 지연
  });
};

// Mock API 함수들 (FastAPI 스타일)
export const mockSchoolAPI = {
  // GET /api/schools?keyword=
  search: searchSchools,
  
  // GET /api/schools/{id}
  getById: getSchoolById,
};




