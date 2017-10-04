function Pager(tableName, itemsPerPage) {
    this.tableName = tableName;
    this.itemsPerPage = itemsPerPage;
    this.navElement = '';
    this.pagerName = '';
    this.currentPage = 1;
    this.pages = 0;
    this.inited = false;

    this.showRecords = function (from, to) {
        var rows = document.getElementById(tableName).rows;
        // i starts from 1 to skip table header row
        for (var i = 1; i < rows.length; i++) {
            if (i < from || i > to)
                rows[i].style.display = 'none';
            else
                rows[i].style.display = '';
        }
    }

    this.showPage = function (pageNumber) {
        if (!this.inited) {
            alert("not inited");
            return;
        }

        this.currentPage = pageNumber;

        var from = (pageNumber - 1) * itemsPerPage + 1;
        var to = from + itemsPerPage - 1;
        this.showRecords(from, to);

        this.navElement.innerHTML = "";

        var initPage = 1;

        if (this.currentPage > this.pages - 3) {
            initPage = this.pages - 3;
        }
        else {
            initPage = this.currentPage;
        }

        var pagerHtml = '<nav><ul class="pagination pagination-sm"><li id="prevPage"><a onclick="' + this.pagerName + '.prev();" aria-label="Previous"> <span aria-hidden="true">&laquo;</span> </a></li>';
        for (var page = initPage; page <= initPage + 3; page++)
            pagerHtml += '<li><a id="pg' + page + '" onclick="' + this.pagerName + '.showPage(' + page + ');">' + page + '</a></li> ';

        pagerHtml += '<li id="nextPage"><a onclick="' + this.pagerName + '.next();" aria-label="Next"> <span aria-hidden="true">&raquo;</span></a></li></ul></nav>';

        this.navElement.innerHTML = pagerHtml;

        var pgNext = document.getElementById('nextPage');
        var pgPrev = document.getElementById('prevPage');

        if (this.currentPage == this.pages)
            pgNext.className = 'disabled';
        else
            pgNext.className = '';
        if (this.currentPage == 1)
            pgPrev.className = 'disabled';
        else
            pgPrev.className = '';
    }

    this.prev = function () {
        if (this.currentPage > 1) {
            //this.currentPage = this.currentPage - 1;
            this.showPage(this.currentPage - 1);
        }
    }

    this.next = function () {
        if (this.currentPage < this.pages) {
            //this.currentPage = this.currentPage + 1;
            this.showPage(this.currentPage + 1);
        }
    }

    this.init = function () {
        if (document.getElementById(tableName)) {
        	var rows = document.getElementById(tableName).rows;
        	var records = (rows.length - 1);
        	this.pages = Math.ceil(records / itemsPerPage);
        }
        this.inited = true;
    }

    this.showPageNav = function (pagerName, positionId) {
        if (!this.inited) {
            alert("not inited");
            return;
        }
        //var element = document.getElementById(positionId);
        this.navElement = document.getElementById(positionId);
        this.pagerName = pagerName;

        var initPage = 1;

        if (this.currentPage > this.pages - 3) {
            initPage = this.pages - 3;
        }
        else {
            initPage = this.currentPage;
        }
        var pagerHtml = '<nav><ul class="pagination pagination-sm"><li id="prevPage"><a onclick="' + this.pagerName + '.prev();" aria-label="Previous"> <span aria-hidden="true">&laquo;</span> </a></li>';
        for (var page = initPage; page <= initPage + 3; page++)
            pagerHtml += '<li><a id="pg' + page + '" onclick="' + this.pagerName + '.showPage(' + page + ');">' + page + '</a></li> ';

        pagerHtml += '<li id="nextPage"><a onclick="' + this.pagerName + '.next();" aria-label="Next"> <span aria-hidden="true">&raquo;</span></a></li></ul></nav>';


        this.navElement.innerHTML = pagerHtml;
    }
}
