"""
로깅 유틸리티
- 크롤링 진행 상황 기록
- 에러 로그 저장
- 성공/실패 통계 출력
"""
import logging
import os
from datetime import datetime

def setup_logger(name: str) -> logging.Logger:
    """
    로거 설정 및 반환

    Args:
        name: 로거 이름 (예: "emart24_crawler")

    Returns:
        설정된 Logger 객체
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # 이미 핸들러가 있으면 중복 추가 방지
    if logger.handlers:
        return logger

    # logs 폴더가 없으면 생성
    os.makedirs("logs", exist_ok=True)

    # 콘솔 출력 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # 파일 출력 핸들러 (logs 폴더에 날짜별 저장)
    log_filename = f"logs/{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.FileHandler(log_filename, encoding='utf-8')
    file_handler.setLevel(logging.DEBUG)

    # 로그 포맷 설정
    formatter = logging.Formatter(
        '[%(asctime)s] %(name)s - %(levelname)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    file_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger
