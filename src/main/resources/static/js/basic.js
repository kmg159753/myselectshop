const host = 'http://' + window.location.host;
let targetId;

$(document).ready(function () {
    const auth = getToken();

    if (auth !== undefined && auth !== '') {
        $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            jqXHR.setRequestHeader('Authorization', auth);
        });
    } else {
        window.location.href = host + '/api/user/login-page';
        return;
    }

    $.ajax({
        type: 'GET',
        url: `/api/user-info`,
        contentType: 'application/json',
    })
        .done(function (res, status, xhr) {
            const username = res.username;
            const isAdmin = !!res.admin;

            if (!username) {
                window.location.href = '/api/user/login-page';
                return;
            }

            $('#username').text(username);
            if (isAdmin) {
                $('#admin').text(true);
                showProduct();
            } else {
                showProduct();
            }
        })
        .fail(function (jqXHR, textStatus) {
            logout();
        });

    // id 가 query 인 녀석 위에서 엔터를 누르면 execSearch() 함수를 실행하라는 뜻입니다.
    $('#query').on('keypress', function (e) {
        if (e.key == 'Enter') {
            execSearch();
        }
    });
    $('#close').on('click', function () {
        $('#container').removeClass('active');
    })
    $('#close2').on('click', function () {
        $('#container2').removeClass('active');
    })
    $('.nav div.nav-see').on('click', function () {
        $('div.nav-see').addClass('active');
        $('div.nav-search').removeClass('active');

        $('#see-area').show();
        $('#search-area').hide();
    })
    $('.nav div.nav-search').on('click', function () {
        $('div.nav-see').removeClass('active');
        $('div.nav-search').addClass('active');

        $('#see-area').hide();
        $('#search-area').show();
    })

    $('#see-area').show();
    $('#search-area').hide();
})

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function execSearch() {
    /**
     * 검색어 input id: query
     * 검색결과 목록: #search-result-box
     * 검색결과 HTML 만드는 함수: addHTML
     */
        // 1. 검색창의 입력값을 가져온다.
    let query = $('#query').val();

    // 2. 검색창 입력값을 검사하고, 입력하지 않았을 경우 focus.
    if (query == '') {
        alert('검색어를 입력해주세요');
        $('#query').focus();
        return;
    }
    // 3. GET /api/search?query=${query} 요청
    $.ajax({
        type: 'GET',
        url: `/api/search?query=${query}`,
        success: function (response) {
            $('#search-result-box').empty();
            // 4. for 문마다 itemDto를 꺼내서 HTML 만들고 검색결과 목록에 붙이기!
            for (let i = 0; i < response.length; i++) {
                let itemDto = response[i];
                let tempHtml = addHTML(itemDto);
                $('#search-result-box').append(tempHtml);
            }
        },
        error(error, status, request) {
            logout();
        }
    })

}

function addHTML(itemDto) {
    /**
     * class="search-itemDto" 인 녀석에서
     * image, title, lprice, addProduct 활용하기
     * 참고) onclick='addProduct(${JSON.stringify(itemDto)})'
     */
    return `<div class="search-itemDto">
        <div class="search-itemDto-left">
            <img src="${itemDto.image}" alt="">
        </div>
        <div class="search-itemDto-center">
            <div>${itemDto.title}</div>
            <div class="price">
                ${numberWithCommas(itemDto.lprice)}
                <span class="unit">원</span>
            </div>
        </div>
        <div class="search-itemDto-right">
            <img src="../images/icon-save.png" alt="" onclick='addProduct(${JSON.stringify(itemDto)})'>
        </div>
    </div>`
}

function addProduct(itemDto) {
    /**
     * modal 뜨게 하는 법: $('#container').addClass('active');
     * data를 ajax로 전달할 때는 두 가지가 매우 중요
     * 1. contentType: "application/json",
     * 2. data: JSON.stringify(itemDto),
     */

    // 1. POST /api/products 에 관심 상품 생성 요청
    $.ajax({
        type: 'POST',
        url: '/api/products',
        contentType: 'application/json',
        data: JSON.stringify(itemDto),
        success: function (response) {
            // 2. 응답 함수에서 modal을 뜨게 하고, targetId 를 reponse.id 로 설정
            $('#container').addClass('active');
            targetId = response.id;
        },
        error(error, status, request) {
            logout();
        }
    });
}

function showProduct() {
    /**
     * 관심상품 목록: #product-container
     * 검색결과 목록: #search-result-box
     * 관심상품 HTML 만드는 함수: addProductItem
     */

    let dataSource = null;

    var sorting = $("#sorting option:selected").val();
    var isAsc = $(':radio[name="isAsc"]:checked').val();

    dataSource = `/api/products?sortBy=${sorting}&isAsc=${isAsc}`;

    $('#product-container').empty();
    $('#search-result-box').empty();
    $('#pagination').pagination({
        dataSource,
        locator: 'content',
        alias: {
            pageNumber: 'page',
            pageSize: 'size'
        },
        totalNumberLocator: (response) => {
            return response.totalElements;
        },
        pageSize: 10,
        showPrevious: true,
        showNext: true,
        ajax: {
            error(error, status, request) {
                if (error.status === 403) {
                    $('html').html(error.responseText);
                    return;
                }
                logout();
            }
        },
        callback: function(response, pagination) {
            $('#product-container').empty();
            for (let i = 0; i < response.length; i++) {
                let product = response[i];
                let tempHtml = addProductItem(product);
                $('#product-container').append(tempHtml);
            }
        }
    });
}

function addProductItem(product) {
    console.log(product)
    return `<div class="product-card">
                <div onclick="window.location.href='${product.link}'">
                    <div class="card-header">
                        <img src="${product.image}"
                             alt="">
                    </div>
                    <div class="card-body">
                        <div class="title">
                            ${product.title}
                        </div>
                        <div class="lprice">
                            <span>${numberWithCommas(product.lprice)}</span>원
                        </div>
                        <div class="isgood ${product.lprice > product.myprice ? 'none' : ''}">
                            최저가
                        </div>
                    </div>
                </div>
            </div>`;
}

function setMyprice() {
    /**
     * 1. id가 myprice 인 input 태그에서 값을 가져온다.
     * 2. 만약 값을 입력하지 않았으면 alert를 띄우고 중단한다.
     * 3. PUT /api/product/${targetId} 에 data를 전달한다.
     *    주의) contentType: "application/json",
     *         data: JSON.stringify({myprice: myprice}),
     *         빠뜨리지 말 것!
     * 4. 모달을 종료한다. $('#container').removeClass('active');
     * 5, 성공적으로 등록되었음을 알리는 alert를 띄운다.
     * 6. 창을 새로고침한다. window.location.reload();
     */
        // 1. id가 myprice 인 input 태그에서 값을 가져온다.
    let myprice = $('#myprice').val();
    // 2. 만약 값을 입력하지 않았으면 alert를 띄우고 중단한다.
    if (myprice == '') {
        alert('올바른 가격을 입력해주세요');
        return;
    }

    // 3. PUT /api/product/${targetId} 에 data를 전달한다.
    $.ajax({
        type: 'PUT',
        url: `/api/products/${targetId}`,
        contentType: 'application/json',
        data: JSON.stringify({myprice: myprice}),
        success: function (response) {

            // 4. 모달을 종료한다. $('#container').removeClass('active');
            $('#container').removeClass('active');
            // 5. 성공적으로 등록되었음을 알리는 alert를 띄운다.
            alert('성공적으로 등록되었습니다.');
            // 6. 창을 새로고침한다. window.location.reload();
            window.location.reload();
        },
        error(error, status, request) {
            logout();
        }
    })
}

function logout() {
    // 토큰 삭제
    Cookies.remove('Authorization', {path: '/'});
    window.location.href = host + '/api/user/login-page';
}

function getToken() {
    let auth = Cookies.get('Authorization');

    if(auth === undefined) {
        return '';
    }

    return auth;
}