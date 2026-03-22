#!/bin/bash
#
# 安宝闪卡 - 一键打包 APK 脚本 (全自动，兼容 Java 8)
# 用法: ./build-apk.sh [debug|release]
#
# 自动完成:
#   1. 检测/下载 Android SDK 组件 (直接下载 zip，不依赖 sdkmanager)
#   2. 检测/下载 Gradle
#   3. 同步 Web 资源到 Android assets
#   4. Gradle 构建 APK
#
# 仅需: Java 8+ 和网络连接 (首次下载约 300MB)
#

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[ OK ]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets/www"
BUILD_TYPE="${1:-debug}"

# SDK 配置
SDK_DIR="$PROJECT_ROOT/.android-sdk"
COMPILE_SDK="33"
BUILD_TOOLS_VER="33.0.2"

# JDK 配置 (AGP 7.x 需要 JDK 11+)
JDK_DIR="$PROJECT_ROOT/.jdk11"
JDK_URL="https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.21%2B9/OpenJDK11U-jdk_x64_linux_hotspot_11.0.21_9.tar.gz"

# Gradle 配置
GRADLE_VERSION="7.5.1"
GRADLE_DIR="$PROJECT_ROOT/.gradle-dist"

# 下载地址
PLATFORM_URL="https://dl.google.com/android/repository/platform-33_r02.zip"
BUILD_TOOLS_URL="https://dl.google.com/android/repository/build-tools_r33.0.2-linux.zip"
GRADLE_URL="https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip"

echo ""
echo "=========================================="
echo "  🧒 安宝闪卡 APK 一键打包工具"
echo "=========================================="
echo ""

# ============ 1. 准备 JDK 11 ============
setup_jdk() {
    info "检查 Java 环境..."

    # 检查项目本地 JDK 11
    if [ -x "$JDK_DIR/bin/java" ]; then
        export JAVA_HOME="$JDK_DIR"
        success "使用本地 JDK 11: $($JDK_DIR/bin/java -version 2>&1 | head -1)"
        return 0
    fi

    # 检查系统 Java 版本
    if command -v java &> /dev/null; then
        SYS_JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '"\K[^"]+' | cut -d. -f1)
        # Java 8 报告为 1.8
        [ "$SYS_JAVA_VER" = "1" ] && SYS_JAVA_VER=$(java -version 2>&1 | head -1 | grep -oP '"\K[^"]+' | cut -d. -f2)

        if [ "$SYS_JAVA_VER" -ge 11 ] 2>/dev/null; then
            JAVA_BIN=$(readlink -f "$(which java)")
            export JAVA_HOME="${JAVA_BIN%/bin/java}"
            if [ ! -d "$JAVA_HOME/lib" ] && [ -d "${JAVA_HOME%/jre}/lib" ]; then
                export JAVA_HOME="${JAVA_HOME%/jre}"
            fi
            success "使用系统 Java: $(java -version 2>&1 | head -1)"
            return 0
        else
            warn "系统 Java 版本为 $SYS_JAVA_VER (需要 11+)，将自动下载 JDK 11"
        fi
    fi

    # 下载 JDK 11
    info "下载 JDK 11 (约 186MB，首次下载)..."
    mkdir -p "$JDK_DIR"
    curl -# -L -o /tmp/_jdk11.tar.gz "$JDK_URL"
    tar -xzf /tmp/_jdk11.tar.gz -C "$JDK_DIR" --strip-components=1
    rm -f /tmp/_jdk11.tar.gz
    export JAVA_HOME="$JDK_DIR"
    success "JDK 11 已安装: $($JDK_DIR/bin/java -version 2>&1 | head -1)"
}

setup_jdk
export PATH="$JAVA_HOME/bin:$PATH"

# ============ 2. 准备 Android SDK ============
setup_sdk() {
    # 优先使用已有 SDK
    for sdk_path in "$ANDROID_HOME" "$ANDROID_SDK_ROOT" "$HOME/Android/Sdk" "$HOME/Library/Android/sdk" "/usr/local/android-sdk"; do
        if [ -n "$sdk_path" ] && [ -d "$sdk_path/platforms" ] && [ -d "$sdk_path/build-tools" ]; then
            SDK_DIR="$sdk_path"
            success "使用已有 Android SDK: $SDK_DIR"
            return 0
        fi
    done

    mkdir -p "$SDK_DIR"

    # 下载 platforms
    if [ ! -f "$SDK_DIR/platforms/android-$COMPILE_SDK/android.jar" ]; then
        info "下载 Android Platform $COMPILE_SDK..."
        mkdir -p "$SDK_DIR/platforms"
        curl -# -L -o /tmp/_platform.zip "$PLATFORM_URL"
        cd "$SDK_DIR/platforms"
        unzip -q -o /tmp/_platform.zip
        # zip 内部文件夹可能叫 android-13
        [ -d "android-13" ] && [ ! -d "android-$COMPILE_SDK" ] && mv android-13 "android-$COMPILE_SDK"
        rm -f /tmp/_platform.zip
        cd "$PROJECT_ROOT"
        success "Android Platform $COMPILE_SDK 已安装"
    else
        success "Android Platform $COMPILE_SDK 已就绪"
    fi

    # 下载 build-tools
    if [ ! -f "$SDK_DIR/build-tools/$BUILD_TOOLS_VER/aapt" ]; then
        info "下载 Build Tools $BUILD_TOOLS_VER..."
        mkdir -p "$SDK_DIR/build-tools"
        curl -# -L -o /tmp/_buildtools.zip "$BUILD_TOOLS_URL"
        cd "$SDK_DIR/build-tools"
        unzip -q -o /tmp/_buildtools.zip
        [ -d "android-13" ] && [ ! -d "$BUILD_TOOLS_VER" ] && mv android-13 "$BUILD_TOOLS_VER"
        rm -f /tmp/_buildtools.zip
        cd "$PROJECT_ROOT"
        success "Build Tools $BUILD_TOOLS_VER 已安装"
    else
        success "Build Tools $BUILD_TOOLS_VER 已就绪"
    fi

    # 创建 licenses 目录（Gradle 需要）
    mkdir -p "$SDK_DIR/licenses"
    echo -e "\n24333f8a63b6825ea9c5514f83c2829b004d1fee" > "$SDK_DIR/licenses/android-sdk-license"
    echo -e "\n84831b9409646a918e30573bab4c9c91346d8abd" > "$SDK_DIR/licenses/android-sdk-preview-license"
}

setup_sdk

export ANDROID_HOME="$SDK_DIR"
export ANDROID_SDK_ROOT="$SDK_DIR"

# 创建 local.properties
cat > "$ANDROID_DIR/local.properties" << EOF
sdk.dir=$SDK_DIR
EOF
success "Android SDK 路径: $SDK_DIR"

# ============ 3. 准备 Gradle ============
setup_gradle() {
    # 系统 Gradle
    if command -v gradle &> /dev/null; then
        GRADLE_CMD="gradle"
        success "使用系统 Gradle"
        return 0
    fi

    # 本地 Gradle
    if [ -x "$GRADLE_DIR/gradle-$GRADLE_VERSION/bin/gradle" ]; then
        GRADLE_CMD="$GRADLE_DIR/gradle-$GRADLE_VERSION/bin/gradle"
        success "使用本地 Gradle $GRADLE_VERSION"
        return 0
    fi

    # 下载 Gradle
    info "下载 Gradle $GRADLE_VERSION (约 110MB)..."
    mkdir -p "$GRADLE_DIR"
    curl -# -L -o "$GRADLE_DIR/gradle.zip" "$GRADLE_URL"
    cd "$GRADLE_DIR"
    unzip -q -o gradle.zip
    rm -f gradle.zip
    cd "$PROJECT_ROOT"

    GRADLE_CMD="$GRADLE_DIR/gradle-$GRADLE_VERSION/bin/gradle"
    chmod +x "$GRADLE_CMD"
    success "Gradle $GRADLE_VERSION 已安装"
}

# 检查 gradlew + wrapper jar
if [ -x "$ANDROID_DIR/gradlew" ] && [ -f "$ANDROID_DIR/gradle/wrapper/gradle-wrapper.jar" ]; then
    GRADLE_CMD="$ANDROID_DIR/gradlew"
    success "使用 Gradle Wrapper"
else
    setup_gradle

    # 生成 Gradle Wrapper
    info "生成 Gradle Wrapper..."
    cd "$ANDROID_DIR"
    "$GRADLE_CMD" wrapper --gradle-version "$GRADLE_VERSION" 2>/dev/null || true
    if [ -x "./gradlew" ]; then
        GRADLE_CMD="./gradlew"
    fi
    cd "$PROJECT_ROOT"
fi

# ============ 4. 同步 Web 资源 ============
info "同步 Web 资源到 Android assets..."

rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"

cp "$PROJECT_ROOT/index.html" "$ASSETS_DIR/"
cp -r "$PROJECT_ROOT/css" "$ASSETS_DIR/"
cp -r "$PROJECT_ROOT/js" "$ASSETS_DIR/"
[ -f "$PROJECT_ROOT/manifest.json" ] && cp "$PROJECT_ROOT/manifest.json" "$ASSETS_DIR/" || true
[ -d "$PROJECT_ROOT/icons" ] && cp -r "$PROJECT_ROOT/icons" "$ASSETS_DIR/" || true

FILE_COUNT=$(find "$ASSETS_DIR" -type f | wc -l)
success "已同步 $FILE_COUNT 个文件到 assets/www/"

# ============ 5. 构建 APK ============
info "开始构建 $BUILD_TYPE APK... (首次构建较慢，请耐心等待)"
echo ""

cd "$ANDROID_DIR"

if [ "$BUILD_TYPE" = "release" ]; then
    $GRADLE_CMD assembleRelease --no-daemon -Dorg.gradle.java.home="$JAVA_HOME"
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
    APK_NAME="baby-flashcard-release.apk"
else
    $GRADLE_CMD assembleDebug --no-daemon -Dorg.gradle.java.home="$JAVA_HOME"
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
    APK_NAME="baby-flashcard-debug.apk"
fi

cd "$PROJECT_ROOT"

# ============ 6. 输出结果 ============
if [ -f "$APK_PATH" ]; then
    OUTPUT_DIR="$PROJECT_ROOT/output"
    mkdir -p "$OUTPUT_DIR"
    cp "$APK_PATH" "$OUTPUT_DIR/$APK_NAME"

    APK_SIZE=$(du -h "$OUTPUT_DIR/$APK_NAME" | cut -f1)

    echo ""
    echo "=========================================="
    echo -e "  ${GREEN}🎉 APK 打包成功！${NC}"
    echo "=========================================="
    echo ""
    echo "  📦 文件: output/$APK_NAME"
    echo "  📏 大小: $APK_SIZE"
    echo "  🏷  类型: $BUILD_TYPE"
    echo ""

    if [ "$BUILD_TYPE" = "debug" ]; then
        echo "  📱 安装到手机:"
        echo "     adb install output/$APK_NAME"
    else
        echo "  🔑 release 版签名后安装:"
        echo "     jarsigner -verbose -keystore my.keystore output/$APK_NAME alias"
        echo "     zipalign -v 4 output/$APK_NAME output/baby-flashcard-aligned.apk"
    fi
    echo ""
else
    error "APK 文件未生成，构建失败"
fi
