#!/usr/bin/env bash

LocalPath=$(pwd)


ENV_MYSQL_HOST="MYSQL_HOST"
ENV_MYSQL_PORT="MYSQL_PORT"
ENV_MYSQL_EXPOSED_PORT="MYSQL_EXPOSED_PORT"
ENV_MYSQL_USER="MYSQL_USER"
ENV_MYSQL_PASSWORD="MYSQL_PASSWORD"
ENV_MYSQL_DATABASE="MYSQL_DATABASE"
ENV_MYSQL_DATA_MOUNT="MYSQL_DATA_MOUNT"

ENV_REDIS_HOST="REDIS_HOST"
ENV_REDIS_PORT="REDIS_PORT"
ENV_REDIS_EXPOSED_PORT="REDIS_EXPOSED_PORT"
ENV_REDIS_PASSWORD="REDIS_PASSWORD"
ENV_REDIS_DATA_MOUNT="REDIS_DATA_MOUNT"

ENV_LAN_IP="LAN_IP"
ENV_EXTERNAL_IP="EXTERNAL_IP"

ENV_XPACK_MCP_MARKET_WEB_PORT="XPACK_MCP_MARKET_WEB_PORT"
ENV_XPACK_MCP_MARKET_MCP_PORT="XPACK_MCP_MARKET_MCP_PORT"

ENV_RABBITMQ_USER="RABBITMQ_USER"
ENV_RABBITMQ_PASSWORD="RABBITMQ_PASSWORD"


XPACK_MCP_MARKET_CONTAINER_NAME="xpack-mcp-market"
MYSQL_CONTAINER_NAME="xpack-mysql"
REDIS_CONTAINER_NAME="xpack-redis"
RABBITMQ_CONTAINER_NAME="xpack-rabbitmq"

MYSQL_ROOT_PASSWORD="mysql_ZTdhRB"
MYSQL_MAP_PORT=33306
MYSQL_DATA_MOUNT="/var/lib/xpack/mysql"

REDIS_PASSWORD="redis_6sJZDm"
REDIS_MAP_PORT=6379

XPACK_MCP_MARKET_WEB_MAP_PORT=3000
XPACK_MCP_MARKET_MCP_MAP_PORT=8002

RABBITMQ_USER="rabbitmq"
RABBITMQ_PASSWORD="rabbitmq_Gs123dA"

APP_NAME="xpack-mcp-market"


echo_fail() {
  printf "\e[91m✘ Error:\e[0m $@\n" >&2
}

echo_pass() {
  printf "\e[92m✔ Passed:\e[0m $@\n" >&2
}

echo_warn() {
  printf "\e[93m⚠ Warning:\e[0m $@\n" >&2
}

echo_pause() {
  printf "\e[94m⏸ Pause:\e[0m $1\n" >&2
}

echo_question() {
  printf "\e[95m? Question:\e[0m $@\n" >&2
}

echo_info() {
  printf "\e[96mℹ Info:\e[0m $1\n" >&2
}

echo_point() {
  printf "\e[94m➜ Point:\e[0m $1\n" >&2
}

echo_bullet() {
  printf "\e[94m• Step:\e[0m $1\n" >&2
}

echo_wait() {
  printf "\e[95m⏳ Waiting:\e[0m $1\n" >&2
}

echo_split() {
  echo "" >&2
  echo "" >&2
  echo -e "\e[94m────────────────────────────────────────────────────────────\e[0m" >&2
}

retry() {
    local -r -i max_wait="$1"; shift
    local -r cmd="$@"

    local -i sleep_interval=2
    local -i curr_wait=0

    until $cmd
    do
        if (( curr_wait >= max_wait ))
        then
            echo_fail "Command '${cmd}' failed after $curr_wait seconds."
            return 1
        else
            curr_wait=$((curr_wait+sleep_interval))
            sleep $sleep_interval
        fi
    done
}

slugify() {
    echo "$1" | tr 'A-Z' 'a-z' | sed -e 's/[^a-zA-Z0-9]/-/g' | awk 'BEGIN{OFS="-"}{$1=$1;print $0}' | sed -e 's/--*/-/g' -e 's/^-//' -e 's/-$//'
}

disable_selinux() {
  # 定义SELinux配置文件的路径
  SELINUX_CONFIG_FILE="/etc/selinux/config"

  # 检查是否有管理员权限
  if [[ $EUID -ne 0 ]]; then
     echo_fail "This script must be run as root"
     exit 1
  fi

  # 备份SELinux配置文件
  cp $SELINUX_CONFIG_FILE ${SELINUX_CONFIG_FILE}.bak

  # 设置SELinux为permissive模式（允许但是记录违规行为）
  setenforce 0

  # 修改SELinux配置文件，永久关闭SELinux
  if grep -q "^SELINUX=" $SELINUX_CONFIG_FILE; then
      sed -i 's/^SELINUX=.*/SELINUX=disabled/' $SELINUX_CONFIG_FILE
  else
      echo "SELINUX=disabled" >> $SELINUX_CONFIG_FILE
  fi

  echo_pass "SELinux has been set to disabled. Please reboot the system for the changes to take effect."
}

TMP_DIR="${TMP_DIR:-/tmp/${APP_NAME}}"
OUTPUT_DIR="${OUTPUT_DIR:-/var/lib/${APP_NAME}/quickstart}"

write_env_var() {
    local environment_dir="${OUTPUT_DIR}/environment"
    mkdir -p ${environment_dir}
    local name="${1}"
    local value="${2}"
    echo_info "Writing ${name}=${value} to ${environment_dir}/${name}"
    echo "${value}" > "${environment_dir}/${name}"
}

read_env_var() {
    local environment_dir="${OUTPUT_DIR}/environment"
    local name="${1}"
    if [ ! -f "${environment_dir}/${name}" ]; then
        environment_dir="${TMP_DIR}/environment"
        if [ ! -f "${environment_dir}/${name}" ]; then
            echo ""
            return
        fi
    fi
    cat "${environment_dir}/${name}"
}

write_env_file() {
    local file_path="${1}"
    mkdir -p $(dirname "${file_path}")
    local environment_dir="${OUTPUT_DIR}/environment"
    > "${file_path}"
    # loop through the environment directory and write the contents to the file
    for file in ${environment_dir}/*
    do
        if [ -f "${file}" ]; then # Ensure it is a file and not a directory
            file_name=$(basename "${file}")
            echo "${file_name}=$(< "${file}")" >> "${file_path}"
        fi
    done
}

clear_output_dir() {
    # Clear the output directory of all files except the log file
    echo ">clear_output_dir" >> $LOG_FILE

    # create a temporary directory
    temp_dir=$(mktemp -d)

    # move each file/directory except for the log file into the temporary directory
    for file in "${OUTPUT_DIR}"/*; do
        if [ "${file}" != "${LOG_FILE}" ]; then
            mv "${file}" "${temp_dir}"
        fi
    done

    # remove the temporary directory and its content
    rm -rf "${temp_dir}"

    echo "<clear_output_dir" >> $LOG_FILE
}

write_ip_env() {
  write_env_var ${ENV_LAN_IP} $(hostname -I | awk '{print $1}')
  write_env_var ${ENV_EXTERNAL_IP} $(dig +short myip.opendns.com @resolver1.opendns.com | grep -E '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$')
}

prepare_for_new_run() {
  NETWORK_NAME="${APP_NAME}-net"
  ENV_FILE="${OUTPUT_DIR}/${APP_NAME}.env"
  LOG_FILE="${LOG_FILE:-${OUTPUT_DIR}/$APP_NAME.log}"
  mkdir -p $(dirname "${LOG_FILE}")
}

wait_for() {
  waitName=$1
  cmd=$2
  echo ${cmd}
  echo_wait "Waiting for ${waitName} to start..."
  retry 30 ${cmd}
  if [ $? -eq 0 ]; then
    echo_pass "${waitName} has been installed successfully"
  else
    echo_fail "${waitName} installation failed"
    exit 1
  fi

}

echo_logo() {
  echo -e "
XXXXXXX       XXXXXXXPPPPPPPPPPPPPPPPP        AAA                  CCCCCCCCCCCCCKKKKKKKKK    KKKKKKK
X:::::X       X:::::XP::::::::::::::::P      A:::A              CCC::::::::::::CK:::::::K    K:::::K
X:::::X       X:::::XP::::::PPPPPP:::::P    A:::::A           CC:::::::::::::::CK:::::::K    K:::::K
X::::::X     X::::::XPP:::::P     P:::::P  A:::::::A         C:::::CCCCCCCC::::CK:::::::K   K::::::K
XXX:::::X   X:::::XXX  P::::P     P:::::P A:::::::::A       C:::::C       CCCCCCKK::::::K  K:::::KKK
   X:::::X X:::::X     P::::P     P:::::PA:::::A:::::A     C:::::C                K:::::K K:::::K   
    X:::::X:::::X      P::::PPPPPP:::::PA:::::A A:::::A    C:::::C                K::::::K:::::K    
     X:::::::::X       P:::::::::::::PPA:::::A   A:::::A   C:::::C                K:::::::::::K     
     X:::::::::X       P::::PPPPPPPPP A:::::A     A:::::A  C:::::C                K:::::::::::K     
    X:::::X:::::X      P::::P        A:::::AAAAAAAAA:::::A C:::::C                K::::::K:::::K    
   X:::::X X:::::X     P::::P       A:::::::::::::::::::::AC:::::C                K:::::K K:::::K   
XXX:::::X   X:::::XXX  P::::P      A:::::AAAAAAAAAAAAA:::::AC:::::C       CCCCCCKK::::::K  K:::::KKK
X::::::X     X::::::XPP::::::PP   A:::::A             A:::::AC:::::CCCCCCCC::::CK:::::::K   K::::::K
X:::::X       X:::::XP::::::::P  A:::::A               A:::::ACC:::::::::::::::CK:::::::K    K:::::K
X:::::X       X:::::XP::::::::P A:::::A                 A:::::A CCC::::::::::::CK:::::::K    K:::::K
XXXXXXX       XXXXXXXPPPPPPPPPPAAAAAAA                   AAAAAAA   CCCCCCCCCCCCCKKKKKKKKK    KKKKKKK
"
}

Set_Centos7_Repo(){
	MIRROR_CHECK=$(cat /etc/yum.repos.d/CentOS-Base.repo |grep "[^#]mirror.centos.org")
	if [ "${MIRROR_CHECK}" ] && [ "${is64bit}" == "64" ];then
		\cp -rpa /etc/yum.repos.d/ /etc/yumBak
		sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*.repo
		sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.epel.cloud|g' /etc/yum.repos.d/CentOS-*.repo
	fi
}

Set_Centos8_Repo(){
	HUAWEI_CHECK=$(cat /etc/motd |grep "Huawei Cloud")
	if [ "${HUAWEI_CHECK}" ] && [ "${is64bit}" == "64" ];then
		\cp -rpa /etc/yum.repos.d/ /etc/yumBak
		sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*.repo
		sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.epel.cloud|g' /etc/yum.repos.d/CentOS-*.repo
		rm -f /etc/yum.repos.d/epel.repo
		rm -f /etc/yum.repos.d/epel-*
	fi
	ALIYUN_CHECK=$(cat /etc/motd|grep "Alibaba Cloud ")
	if [  "${ALIYUN_CHECK}" ] && [ "${is64bit}" == "64" ] && [ ! -f "/etc/yum.repos.d/Centos-vault-8.5.2111.repo" ];then
		rename '.repo' '.repo.bak' /etc/yum.repos.d/*.repo
		wget https://mirrors.aliyun.com/repo/Centos-vault-8.5.2111.repo -O /etc/yum.repos.d/Centos-vault-8.5.2111.repo
		wget https://mirrors.aliyun.com/repo/epel-archive-8.repo -O /etc/yum.repos.d/epel-archive-8.repo
		sed -i 's/mirrors.cloud.aliyuncs.com/url_tmp/g'  /etc/yum.repos.d/Centos-vault-8.5.2111.repo &&  sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo && sed -i 's/url_tmp/mirrors.aliyun.com/g' /etc/yum.repos.d/Centos-vault-8.5.2111.repo
		sed -i 's/mirrors.aliyun.com/mirrors.cloud.aliyuncs.com/g' /etc/yum.repos.d/epel-archive-8.repo
	fi
	MIRROR_CHECK=$(cat /etc/yum.repos.d/CentOS-Linux-AppStream.repo |grep "[^#]mirror.centos.org")
	if [ "${MIRROR_CHECK}" ] && [ "${is64bit}" == "64" ];then
		\cp -rpa /etc/yum.repos.d/ /etc/yumBak
		sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*.repo
		sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.epel.cloud|g' /etc/yum.repos.d/CentOS-*.repo
	fi
}

Get_Pack_Manager(){
	if [ -f "/usr/bin/yum" ] && [ -d "/etc/yum.repos.d" ]; then
		PM="yum"
	elif [ -f "/usr/bin/apt-get" ] && [ -f "/usr/bin/dpkg" ]; then
		PM="apt-get"
	fi
}

Install_RPM_Pack(){
#	yumPath=/etc/yum.conf
	Centos8Check=$(cat /etc/redhat-release | grep ' 8.' | grep -iE 'centos|Red Hat')
	if [ "${Centos8Check}" ];then
		Set_Centos8_Repo

	fi
	Centos7Check=$(cat /etc/redhat-release | grep ' 7.' | grep -iE 'centos|Red Hat')
	if [ "${Centos7Check}" ];then
		Set_Centos7_Repo
	fi
#	isExc=$(cat $yumPath|grep httpd)
#	if [ "$isExc" = "" ];then
#		echo "exclude=httpd nginx php mysql mairadb python-psutil python2-psutil" >> $yumPath
#	fi

	if [ -f "/etc/redhat-release" ] && [ $(cat /etc/os-release|grep PLATFORM_ID|grep -oE "el8") ];then
		yum config-manager --set-enabled powertools
		yum config-manager --set-enabled PowerTools
	fi

	if [ -f "/etc/redhat-release" ] && [ $(cat /etc/os-release|grep PLATFORM_ID|grep -oE "el9") ];then
		dnf config-manager --set-enabled crb -y
	fi

  yum install -y yum-utils
  curl https://download.docker.com
  DockerPackage="docker"
  if [ $? == 0 ];then
    yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
    DockerPackage="docker-ce"
  fi


	#尝试同步时间(从bt.cn)
	echo 'Synchronizing system time...'
	if [ -z "${Centos8Check}" ]; then
		yum install ntp -y
		rm -rf /etc/localtime
		ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

		#尝试同步国际时间(从ntp服务器)
		ntpdate 0.asia.pool.ntp.org
		setenforce 0
	fi

	startTime=`date +%s`

	sed -i 's/SELINUX=enforcing/SELINUX=disabled/' /etc/selinux/config
  yumPacks="jq qrencode unzip ${DockerPackage} curl wget bind-utils pwgen"

	for yumPack in ${yumPacks}
	do
		rpmPack=$(rpm -q ${yumPack})
		packCheck=$(echo ${rpmPack}|grep not)
		if [ "${packCheck}" ]; then
			yum install ${yumPack} -y
		fi
	done
	if [ -f "/usr/bin/dnf" ]; then
		dnf install -y redhat-rpm-config
	fi

	ALI_OS=$(cat /etc/redhat-release |grep "Alibaba Cloud Linux release 3")
	if [ -z "${ALI_OS}" ];then
		yum install epel-release -y
	fi
}

Remove_Package(){
	local PackageNmae=$1
	if [ "${PM}" == "yum" ];then
		isPackage=$(rpm -q ${PackageNmae}|grep "not installed")
		if [ -z "${isPackage}" ];then
			yum remove ${PackageNmae} -y
		fi
	elif [ "${PM}" == "apt-get" ];then
		isPackage=$(dpkg -l|grep ${PackageNmae})
		if [ "${PackageNmae}" ];then
			apt-get remove ${PackageNmae} -y
		fi
	fi
}

Set_Ubuntu_Docker_Source() {
  curl https://download.docker.com
  if [ $? != 0 ]; then
    return
  fi
  # 获取发行版信息
 distro=$(lsb_release -is)
 arch=$(dpkg --print-architecture)

 # 根据发行版和架构执行不同的命令
 if [ "$distro" = "Ubuntu" ]; then
     echo "Detected Ubuntu."
     if [ "$arch" = "amd64" ]; then
         echo "Architecture: amd64"
         curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
         sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
     elif [[ "$arch" == arm64 ]]; then
         echo "Architecture: arm64"
         curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
         sudo add-apt-repository -y "deb [arch=arm64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
     else
         echo "Unsupported architecture: $arch"
         exit 1
     fi
 elif [ "$distro" = "Debian" ]; then
     echo "Detected Debian."
     if [ "$arch" = "amd64" ]; then
         echo "Architecture: amd64"
         curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
         sudo add-apt-repository -y "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
     elif [[ "$arch" == arm64 ]]; then
         echo "Architecture: arm"
         curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -
         sudo add-apt-repository -y "deb [arch=arm64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
     else
         echo "Unsupported architecture: $arch"
         exit 1
     fi
 else
     echo "Unsupported distribution: $distro"
     exit 1
 fi
}

Install_Deb_Pack(){
	ln -sf bash /bin/sh
	UBUNTU_22=$(cat /etc/issue|grep "Ubuntu 22")
	if [ "${UBUNTU_22}" ];then
		apt-get remove needrestart -y
	fi
	ALIYUN_CHECK=$(cat /etc/motd|grep "Alibaba Cloud ")
	if [ "${ALIYUN_CHECK}" ] && [ "${UBUNTU_22}" ];then
		apt-get remove libicu70 -y
	fi
	apt-get update -y
	apt-get install bash -y
	if [ -f "/usr/bin/bash" ];then
		ln -sf /usr/bin/bash /bin/sh
	fi
	apt install -y software-properties-common


  Set_Ubuntu_Docker_Source


	apt-get update -y

	LIBCURL_VER=$(dpkg -l|grep libcurl4|awk '{print $3}')
	if [ "${LIBCURL_VER}" == "7.68.0-1ubuntu2.8" ];then
		apt-get remove libcurl4 -y
		apt-get install curl -y
	fi

#	debPacks="wget curl libcurl4-openssl-dev gcc make zip unzip tar openssl libssl-dev gcc libxml2 libxml2-dev zlib1g zlib1g-dev libjpeg-dev libpng-dev lsof libpcre3 libpcre3-dev cron net-tools swig build-essential libffi-dev libbz2-dev libncurses-dev libsqlite3-dev libreadline-dev tk-dev libgdbm-dev libdb-dev libdb++-dev libpcap-dev xz-utils git qrencode sqlite3";
	debPacks="wget curl qrencode docker.io docker-ce jq unzip dnsutils pwgen"

	for debPack in ${debPacks}
	do
		packCheck=$(dpkg -l|grep -w ${debPack})
		if [ "$?" -ne "0" ] ;then
			apt-get install -y $debPack
		fi
	done

	if [ ! -d '/etc/letsencrypt' ];then
		mkdir -p /etc/letsencryp
		mkdir -p /var/spool/cron
		if [ ! -f '/var/spool/cron/crontabs/root' ];then
			echo '' > /var/spool/cron/crontabs/root
			chmod 600 /var/spool/cron/crontabs/root
		fi
	fi
}

Get_Versions(){
	redhat_version_file="/etc/redhat-release"
	deb_version_file="/etc/issue"

	if [[ $(grep Anolis /etc/os-release) ]] && [[ $(grep VERSION /etc/os-release|grep 8.8) ]];then
		if [ -f "/usr/bin/yum" ];then
			os_type="anolis"
			os_version="8"
			return
		fi
	fi


	if [ -f "/etc/os-release" ];then
		. /etc/os-release
		OS_V=${VERSION_ID%%.*}
		if [ "${ID}" == "opencloudos" ] && [[ "${OS_V}" =~ ^(9)$ ]];then
			os_type="opencloudos"
			os_version="9"
			pyenv_tt="true"
		elif { [ "${ID}" == "almalinux" ] || [ "${ID}" == "centos" ] || [ "${ID}" == "rocky" ]; } && [[ "${OS_V}" =~ ^(9)$ ]]; then
			os_type="el"
			os_version="9"
			pyenv_tt="true"
		fi
		if [ "${pyenv_tt}" ];then
			return
		fi
	fi

	if [ -f $redhat_version_file ];then
		os_type='el'
		is_aliyunos=$(cat $redhat_version_file|grep Aliyun)
		if [ "$is_aliyunos" != "" ];then
			return
		fi

		if [[ $(grep "Alibaba Cloud" /etc/redhat-release) ]] && [[ $(grep al8 /etc/os-release) ]];then
			os_type="ali-linux-"
			os_version="al8"
			return
		fi

		if [[ $(grep "TencentOS Server" /etc/redhat-release|grep 3.1) ]];then
			os_type="TencentOS-"
			os_version="3.1"
			return
		fi

		os_version=$(cat $redhat_version_file|grep CentOS|grep -Eo '([0-9]+\.)+[0-9]+'|grep -Eo '^[0-9]')
		if [ "${os_version}" = "5" ];then
			os_version=""
		fi
		if [ -z "${os_version}" ];then
			os_version=$(cat /etc/redhat-release |grep Stream|grep -oE 8)
		fi
	else
		os_type='ubuntu'
		os_version=$(cat $deb_version_file|grep Ubuntu|grep -Eo '([0-9]+\.)+[0-9]+'|grep -Eo '^[0-9]+')
		if [ "${os_version}" = "" ];then
			os_type='debian'
			os_version=$(cat $deb_version_file|grep Debian|grep -Eo '([0-9]+\.)+[0-9]+'|grep -Eo '[0-9]+')
			if [ "${os_version}" = "" ];then
				os_version=$(cat $deb_version_file|grep Debian|grep -Eo '[0-9]+')
			fi
			if [ "${os_version}" = "8" ];then
				os_version=""
			fi
			if [ "${is64bit}" = '32' ];then
				os_version=""
			fi
		else
			if [ "$os_version" = "14" ];then
				os_version=""
			fi
			if [ "$os_version" = "12" ];then
				os_version=""
			fi
			if [ "$os_version" = "19" ];then
				os_version=""
			fi
			if [ "$os_version" = "21" ];then
				os_version=""
			fi
			if [ "$os_version" = "20" ];then
				os_version2004=$(cat /etc/issue|grep 20.04)
				if [ -z "${os_version2004}" ];then
					os_version=""
				fi
			fi
		fi
	fi
}

get_memory_gb() {
    local memory_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    local memory_gb=$(echo "scale=1; $memory_total / 1024 / 1024" | bc)
    echo "$memory_gb"
}

get_cpu_cores() {
    local cpu_cores=$(grep -c ^processor /proc/cpuinfo)
    echo "$cpu_cores"
}

disable_selinux

prepare_for_new_run

if [ $(whoami) != "root" ];then
	if [ -f "/usr/bin/curl" ];then
		DOWN_EXEC="curl -sSO"
	else
		DOWN_EXEC="wget -O quick-start.sh"
	fi

	echo "====================================================="
	echo_fail "Detected that the program is currently being executed with non root privileges..."
	IS_UBUNTU=$(cat /etc/issue|grep Ubuntu)
	IS_DEBIAN=$(cat /etc/issue|grep Debian)
	if [ "${IS_UBUNTU}" ];then
		echo_info "Please use the following command to re execute..."
		echo "sudo $DOWN_EXEC https://download.apipark.com/install/quick-start.sh; sudo bash quick-start.sh"
	elif [ "${IS_DEBIAN}" ];then
		echo_info "Please execute the su root command to switch to the root account and then execute the following command to redeploy..."
		echo "$DOWN_EXEC https://download.apipark.com/install/quick-start.sh; bash quick-start.sh"
	else
		if [ -f "/usr/bin/sudo" ];then
			echo_info "Please use the following command to re execute the script with root privileges..."
			echo "sudo $DOWN_EXEC https://download.apipark.com/install/quick-start.sh;sudo bash quick-start.sh"
		else
			echo_info "Please execute the su root command to switch to the root account and then execute the following command to redeploy..."
			echo "$DOWN_EXEC https://download.apipark.com/install/quick-start.sh; bash quick-start.sh"
		fi
	fi

	echo "-----------------------------------------------------"
	exit 1
fi

is64bit=$(getconf LONG_BIT)
if [ "${is64bit}" != '64' ];then
	echo_fail "Sorry, the current version does not support 32-bit systems. Please use a 64 bit system";
	exit 1
fi

Centos6Check=$(cat /etc/redhat-release | grep ' 6.' | grep -iE 'centos|Red Hat')
if [ "${Centos6Check}" ];then
	echo "Does not support Centos6, please replace with Centos7/8/9."
	exit 1
fi

UbuntuCheck=$(cat /etc/issue|grep Ubuntu|awk '{print $2}'|cut -f 1 -d '.')
if [ "${UbuntuCheck}" ] && [ "${UbuntuCheck}" -lt "16" ];then
	echo "Does not support Ubuntu ${UbuntuCheck}, suggest replacing Ubuntu 18/20."
	exit 1
fi
HOSTNAME_CHECK=$(cat /etc/hostname)
if [ -z "${HOSTNAME_CHECK}" ];then
	echo "The current host name is empty and cannot install APIPark. Please consult the server operator to set up the host name before reinstalling"
	exit 1
fi

VersionFile="${LocalPath}/version.json"
download_version_file() {
  downloadURL="https://public.eolinker.com/xpack/version.json"
  echo_info "Download version file from ${downloadURL}..."
  curl -sS --connect-timeout 10 -m 10 ${downloadURL} > ${VersionFile}
}

init_network() {
  exists=$(docker network ls --filter "name=^${NETWORK_NAME}$" --format "{{.Name}}")

  if [ -n "$exists" ]; then
      echo_info "network ${NETWORK_NAME} already exists"
      return
  fi
  subnet="172.101.0.0/24"
  gateway="172.101.0.1"
  network_check subnet
  echo_info "init docker network..."
  echo "create network ${NETWORK_NAME} with subnet ${subnet} and gateway ${gateway}"
  docker network create --driver bridge --subnet "$subnet" --gateway "$gateway" ""${NETWORK_NAME}
  if [ $? -eq 0 ]; then
    echo_pass "init docker network success"
  else
    echo_fail "init docker network failed"
    exit 1
  fi
}

network_check() {
  echo_info "checking docker network..."
  network_to_check=$1
  # 检查 Docker 网络中的网段
  docker_networks=$(docker network ls -q)
  for network in $docker_networks; do
      docker_network_subnet=$(docker network inspect -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' $network)
      if [ "$docker_network_subnet" == "$network_to_check" ]; then
          echo_fail "Docker network $network already exists. Please remove $network_to_check"
          exit 1
      fi
  done
  echo_pass "finish checking docker network..."
}

remove_container() {
  local containerName=$1
  exists=$(docker ps -a --filter "name=^/${containerName}$" --format "{{.Names}}")
  if [ -n "$exists" ]; then
      echo_info "Removing container ${containerName}..."
      docker rm -f ${containerName}
  fi
}



exist_container() {
  local containerName=$1
  reinstall=$2
  exists=$(docker ps -a --filter "name=^/${containerName}$" --format "{{.Names}}")
  if [ -n "$exists" ]; then
    if [[ "${reinstall}" == "true" ]]; then
      echo_info "Container ${containerName} already exists, reinstalling..."
      remove_container ${containerName}
      return 0
    fi
    echo_question "Container ${containerName} already exists. Do you want to reinstall container? (yes/no)"
    read -r installChoice
    # 直到输入yes或no
    while [[ "$installChoice" != "yes" && "$installChoice" != "no" ]]; do
      echo_question "Container ${containerName} already exists. Do you want to reinstall container? (yes/no)"
      read -r installChoice
    done
    if [[ "$installChoice" == "yes" ]]; then
      remove_container ${containerName}
    else
      return 1
    fi
  fi
  return 0
}

pull_image() {
  local imageName=$1
  echo_info "Now Pulling ${imageName}..."
  docker pull ${imageName}
  if [ $? -eq 0 ]; then
    echo_pass "Pull ${imageName} success"
  else
    echo_fail "Pull ${imageName} failed"
    exit 1
  fi
}

get_arch() {
  ARCH=$(uname -m)

  if [ "$ARCH" == "x86_64" ]; then
      ARCH="amd64"
  elif [ "$ARCH" == "aarch64" ]; then
      ARCH="arm64"
  else
      echo "Unsupported architecture: $ARCH"
      exit 1
  fi
  echo $ARCH
}

load_image() {
  file=$1
  imageName=$2
  # 加载镜像
  echo_info "Loading Docker image from ${file}..."
  loaded_image_id=$(docker load -i ${file} | grep -oP '(?<=Loaded image: ).*')

  # 检查加载是否成功
  if [ -z "$loaded_image_id" ]; then
      echo_info "Failed to load Docker image from ${file}."
      exit 1
  fi

  # 打印加载的镜像信息
  echo_info "Loaded image: ${loaded_image_id}"

  # 使用 docker tag 重新命名镜像
  echo_info "Tagging image ${loaded_image_id} as ${imageName}..."
  docker tag ${loaded_image_id} ${imageName}

  # 检查是否成功重命名
  if [ $? -eq 0 ]; then
      echo_pass "Successfully tagged image as ${imageName}."
  else
      echo_fail "Failed to tag image."
      exit 1
  fi
}

download_package_docker() {
  name=$1
  skip=$2
  image=$(jq -r ".downloads.${name}.docker" ${VersionFile})
  version=$(jq -r ".downloads.${name}.version" ${VersionFile})
  url=$(jq -r ".downloads.${name}.url" ${VersionFile})
  file=$(jq -r ".downloads.${name}.tar" ${VersionFile})
  if [[ -f "${file}" && ${skip} != "true" ]]; then
    # 是否重新下载包
    echo_question "${file} already exists. Do you want to re-download package? (yes/no)"
    read -r installChoice
    # 直到输入yes或no
    while [[ "$installChoice" != "yes" && "$installChoice" != "no" ]]; do
      echo_question "${file} already exists. Do you want to re-download package? (yes/no)"
      read -r installChoice
    done
    if [[ "$installChoice" == "no" ]]; then
      load_image ${file} ${image}:${version}
      echo ${image}:${version}
      return
    fi
  fi
  arch=$(get_arch)
  downloadURL=$(echo $url | sed "s/\${VERSION}/$version/g" | sed "s/\${ARCH}/$arch/g")
  echo_info "Download package from ${downloadURL}..."


  echo_info " wget ${downloadURL} -O ${file}"
  wget ${downloadURL} -O ${file}

  if [ $? -eq 0 ]; then
    echo_pass "Download package success"
  else
    echo_fail "Download package failed"
    exit 1
  fi
  load_image ${file} ${image}:${version}
  if [ $? -eq 0 ]; then
    echo_pass "Load package success"
  else
    echo_fail "Load package failed"
    exit 1
  fi
  echo ${image}:${version}
}

install_mysql() {
  exist_container ${MYSQL_CONTAINER_NAME}
  if [ $? -eq 1 ]; then
    # 检测到本地已经存在MYSQL容器，跳过安装
    return
  fi
#  pull_image ${imageName}

  imageName=$(download_package_docker "dependencies.mysql")
  mkdir -p ${MYSQL_DATA_MOUNT}
  dockerCmd="docker run -dt --name ${MYSQL_CONTAINER_NAME} --restart=always --privileged=true
  --network=${NETWORK_NAME} -p ${MYSQL_MAP_PORT}:3306 -v ${MYSQL_DATA_MOUNT}:/var/lib/mysql
  -e MYSQL_DATABASE=xpack -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
  ${imageName} --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci"
  echo `${dockerCmd}`

  wait_for "MySQL" "docker exec -i ${MYSQL_CONTAINER_NAME} mysqladmin -u root -p${MYSQL_ROOT_PASSWORD} ping"
  write_mysql_env "${MYSQL_CONTAINER_NAME}" "3306" "apipark" "root" "${MYSQL_ROOT_PASSWORD}" "${MYSQL_MAP_PORT}" "${MYSQL_DATA_MOUNT}"
}

write_mysql_env() {
  write_env_var "${ENV_MYSQL_HOST}" $1
  write_env_var "${ENV_MYSQL_PORT}" $2
  write_env_var "${ENV_MYSQL_DATABASE}" $3
  write_env_var "${ENV_MYSQL_USER}" $4
  write_env_var "${ENV_MYSQL_PASSWORD}" $5
  write_env_var "${ENV_MYSQL_EXPOSED_PORT}" $6
  write_env_var ${ENV_MYSQL_DATA_MOUNT} $7
}

install_redis() {
  exist_container ${REDIS_CONTAINER_NAME}
  if [ $? -eq 1 ]; then
    # 检测到本地已经存在Redis容器，跳过安装
    return
  fi
  redis_run_cmd="redis-server --protected-mode yes --logfile redis.log --appendonly no --port 6379 --requirepass ${REDIS_PASSWORD}"
  imageName=$(download_package_docker "dependencies.redis")

  dockerCmd="docker run -dt --name ${REDIS_CONTAINER_NAME} --restart=always --privileged=true \
  --network=${NETWORK_NAME} -p ${REDIS_MAP_PORT}:6379 \
  ${imageName} ${redis_run_cmd}"
  echo -e `${dockerCmd}`

  wait_for "Redis" "docker exec -i ${REDIS_CONTAINER_NAME} redis-cli ping"

  write_redis_env "${REDIS_CONTAINER_NAME}" "6379" "${REDIS_PASSWORD}" "${REDIS_MAP_PORT}"

}

write_redis_env() {
  write_env_var "${ENV_REDIS_HOST}" $1
  write_env_var "${ENV_REDIS_PORT}" $2
  write_env_var "${ENV_REDIS_PASSWORD}" $3
  write_env_var "${ENV_REDIS_EXPOSED_PORT}" $4
  write_env_var "${ENV_REDIS_DATA_MOUNT}" $5
}

upgrade_xpack_mcp_market() {
  exist_container ${XPACK_MCP_MARKET_CONTAINER_NAME} "true"
  imageName=$(download_package_docker "program.xpack_mcp_market" "true")
  run_xpack_mcp_market
  echo_pass "Upgrade XPACK MCP MARKET success"

}

run_xpack_mcp_market() {
  imageName=$(download_package_docker "program.xpack_mcp_market")
  dockerCmd="docker run -dt --name ${XPACK_MCP_MARKET_CONTAINER_NAME} --restart=always --privileged=true \
  --network=${NETWORK_NAME} -p ${XPACK_MCP_MARKET_WEB_MAP_PORT}:3000 -p ${XPACK_MCP_MARKET_MCP_MAP_PORT}:8002 \
  ${imageName}"
  echo -e `${dockerCmd}`
  
  write_env_var ${ENV_XPACK_MCP_MARKET_WEB_PORT} ${XPACK_MCP_MARKET_WEB_MAP_PORT}
  write_env_var ${ENV_XPACK_MCP_MARKET_MCP_PORT} ${XPACK_MCP_MARKET_MCP_MAP_PORT}

  wait_for "XPACK MCP MARKET" "curl -s -o /dev/null http://127.0.0.1:${XPACK_MCP_MARKET_WEB_MAP_PORT}"
}

install_xpack_mcp_market() {
  exist_container ${XPACK_MCP_MARKET_CONTAINER_NAME}
  if [ $? -eq 1 ]; then
    return
  fi

  run_xpack_mcp_market
  echo_pass "Install XPACK MCP MARKET success"
}

install_rabbitmq() {
  exist_container ${RABBITMQ_CONTAINER_NAME}
  if [ $? -eq 1 ]; then
    return
  fi
  imageName=$(download_package_docker "dependencies.rabbitmq")
  echo_info "Installing RABBITMQ Node "

  dockerCmd="docker run -dt --name ${RABBITMQ_CONTAINER_NAME} --restart=always --privileged=true \
  --network=${NETWORK_NAME} -e RABBITMQ_DEFAULT_USER=${RABBITMQ_USER}  \
  -e RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD} \
  ${imageName}"
  echo `${dockerCmd}`
  write_env_var ${ENV_RABBITMQ_USER} ${RABBITMQ_USER}
  write_env_var ${ENV_RABBITMQ_PASSWORD} ${RABBITMQ_PASSWORD}
  echo_pass "Install RABBITMQ success"
}

install() {
  echo_split
  install_mysql
  echo_split
  install_redis
  echo_split
  install_rabbitmq
  echo_split
  install_xpack_mcp_market
  echo_logo
  print_xpack_mcp_market_info
}

upgrade() {
  echo_split
  echo_info "Upgrading XPack MCP Market to the latest version(${XPACK_VERSION})..."
  upgrade_xpack_mcp_market
  echo_logo
  print_xpack_mcp_market_info
}

print_xpack_mcp_market_info() {
  # 若ENV_LAN_IP不存在，则报程序未安装，请先安装APIPark
  lanIP=$(read_env_var ${ENV_LAN_IP})
  if [[ "${lanIP}" == "" ]]; then
    echo_fail "XPack MCP Market is not installed. Please install XPack MCP Market first."
    operate
    return
  fi

  
  webPort=$(read_env_var ${ENV_XPACK_MCP_MARKET_WEB_PORT})
  mcpPort=$(read_env_var ${ENV_XPACK_MCP_MARKET_MCP_PORT})
  echo_pass "XPack MCP Market has run successfully. Version is ${XPACK_VERSION}."
  echo_info "The Web UI information is as follows:"
  echo_info "Homepage: http://$(read_env_var ${ENV_EXTERNAL_IP}):${webPort}"
  echo_info "Admin dashboard: http://$(read_env_var ${ENV_EXTERNAL_IP}):${webPort}/admin"
  echo_info "Admin Username: admin"
  echo_info "Admin Password: 123456789"
  echo_info "MCP endpoint: http://$(read_env_var ${ENV_EXTERNAL_IP}):${mcpPort}"
}

valid_port() {
  port=$1
  if [[ $port -lt 1024 || $port -gt 65535 ]]; then
    echo_fail "The port must be between 1024 and 65535"
    return 1
  fi
  return 0
}

read_port() {
  default_port=$1
  read -r port
  if [[ -z "${port}" ]]; then
    echo_info "The default port is: ${default_port}"
    port=${default_port}
  fi
  while ! [[ $port =~ ^[0-9]+$ ]] || [[ $port -lt 1024 || $port -gt 65535 ]]; do
      echo "The port must be a number between 1024 and 65535"
      echo -n "Please re-enter the port: "
      read -r port
      if [[ -z "${port}" ]]; then
        echo "The default port is: ${default_port}"
        port=${default_port}
      fi
    done

  echo ${port}
}

remove_network() {
  echo_info "Removing network: ${NETWORK_NAME}"
  networkName=$1
  docker network rm ${networkName}
}

remove_mysql() {
  remove_container ${MYSQL_CONTAINER_NAME}
  mysqlMount=$(read_env_var "${ENV_MYSQL_DATA_MOUNT}")
  if [[ "${mysqlMount}" != "" && "${mysqlMount}" != "/" ]]; then
    echo_question "Do you want to remove the mysql data?(yes/no)"
    read -r removeMysql
    # 直到用户回复yes或no，退出循环
    while [[ "$removeMysql" != "yes" && "$removeMysql" != "no" ]]; do
      echo_fail "Please enter yes or no."
      read -r removeMysql
    done
    if [[ "$removeMysql" == "yes" ]]; then
      rm -fr ${mysqlMount}
    fi
  fi
}

remove_redis() {
  remove_container ${REDIS_CONTAINER_NAME}
  redisMount=$(read_env_var "${ENV_REDIS_DATA_MOUNT}")
  if [[ "${redisMount}" != ""  &&  "${redisMount}" != "/" ]]; then
    echo_question "Do you want to remove the redis data?(yes/no)"
    read -r removeRedis
    # 直到用户回复yes或no，退出循环
    while [[ "$removeRedis" != "yes" && "$removeRedis" != "no" ]]; do
      echo_fail "Please enter yes or no."
      read -r removeRedis
    done
    if [[ "$removeRedis" == "yes" ]]; then
      rm -fr ${redisMount}
    fi
  fi
}

remove_rabbitmq() {
  remove_container ${RABBITMQ_CONTAINER_NAME}
}

remove_xpack_mcp_market() {
  remove_container ${XPACK_MCP_MARKET_CONTAINER_NAME}
}

clear_all() {
  remove_mysql
  remove_redis
  remove_rabbitmq
  remove_xpack_mcp_market
  remove_network ${NETWORK_NAME}
  rm -fr /tmp/${APP_NAME}/*
}

operate() {
  echo_logo
  echo_split
  echo_question "Hello, Welcome to use XPack MCP Market! What do you want to do?"
  echo_point "1. Install XPack MCP Market"
  echo_point "2. Upgrade XPack MCP Market(Latest is ${XPACK_VERSION})"
  echo_point "3. Print system information"
  echo_point "4. Uninstall XPack MCP Market"
  echo_point "5. Exit"

  read -r programChoice

  if [[ "$programChoice" == "1" ]]; then
    # 检查系统类型
    Get_Pack_Manager
    if [ "${PM}" = "yum" ]; then
      Install_RPM_Pack
    elif [ "${PM}" = "apt-get" ]; then
      Install_Deb_Pack
    fi
    write_ip_env
    sleep 5s
    echo_info "start docker..."
    systemctl start docker
    echo_info "start network..."
    
    init_network
    install
  elif [[ "$programChoice" == "2" ]]; then
    upgrade
  elif [[ "$programChoice" == "3" ]]; then
    echo_logo
    print_xpack_mcp_market_info
  elif [[ "$programChoice" == "4" ]]; then
    clear_all
    operate_another
  elif [[ "$programChoice" == "5" ]]; then
    exit 0
  fi
}

operate_another() {
  # 询问是否还需要执行其他操作
  echo_question "Do you want to reinstall XPack MCP Market? (yes/no)"
  read -r programChoice
  # 直到输入yes或no
  while [[ "$programChoice" != "yes" && "$programChoice" != "no" ]]; do
    echo_fail "Please enter yes or no."
    read -r programChoice
  done
  if [[ "$programChoice" == "yes" ]]; then
    operate
  fi
  exit 0
}

download_version_file

XPACK_VERSION=$(jq -r ".downloads.program.xpack_mcp_market.version" ${VersionFile})
operate
